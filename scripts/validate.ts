import { execSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { extname, join } from "node:path";

const SLUG_REGEX = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const ALLOWED_IMAGE_EXTS = new Set([".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg"]);
const MAX_IMAGE_SIZE = 1024 * 1024; // 1 MB
const MAX_TOTAL_SIZE = 5 * 1024 * 1024; // 5 MB total per post

function parseFrontmatter(content: string): Record<string, string> | null {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return null;

  const result: Record<string, string> = {};
  for (const line of match[1].split(/\r?\n/)) {
    const colon = line.indexOf(":");
    if (colon === -1) continue;
    result[line.slice(0, colon).trim()] = line.slice(colon + 1).trim();
  }
  return result;
}

function validatePost(slug: string, prAuthorId?: string): string[] {
  const errors: string[] = [];
  const postDir = join("posts", slug);

  if (!SLUG_REGEX.test(slug)) {
    errors.push(`Invalid slug "${slug}": must be lowercase letters, numbers, and hyphens only.`);
  }

  const mdxPath = join(postDir, "index.mdx");
  if (!existsSync(mdxPath)) {
    errors.push("Missing index.mdx");
    return errors;
  }

  const content = readFileSync(mdxPath, "utf-8");
  const fm = parseFrontmatter(content);

  if (!fm) {
    errors.push("Missing or malformed frontmatter block");
    return errors;
  }

  for (const field of ["title", "description", "tags", "author"]) {
    if (!fm[field]) errors.push(`Missing required frontmatter field: "${field}"`);
  }

  if (fm.author) {
    if (!/^\d+$/.test(fm.author)) {
      errors.push(`"author" must be a numeric GitHub user ID — run: pnpm get-github-id <username>`);
    } else if (prAuthorId && fm.author !== prAuthorId) {
      errors.push(`"author" ID (${fm.author}) does not match the PR opener's GitHub ID (${prAuthorId})`);
    }
  }

  if (fm.coverImage) {
    errors.push(`Do not set "coverImage" — place your cover image at images/cover.{png,jpg,jpeg,webp,svg}`);
  }

  const COVER_EXTS = [".png", ".jpg", ".jpeg", ".webp", ".svg"];
  const hasCover = COVER_EXTS.some((ext) => existsSync(join(postDir, "images", `cover${ext}`)));
  if (!hasCover) {
    errors.push("Missing required cover image at images/cover.{png,jpg,jpeg,webp,svg}");
  }

  const imagesDir = join(postDir, "images");
  if (existsSync(imagesDir)) {
    let totalSize = 0;
    for (const file of readdirSync(imagesDir)) {
      const filePath = join(imagesDir, file);
      if (!statSync(filePath).isFile()) continue;

      const ext = extname(file).toLowerCase();
      if (!ALLOWED_IMAGE_EXTS.has(ext)) {
        errors.push(`Unsupported image format "${file}" — allowed: ${[...ALLOWED_IMAGE_EXTS].join(", ")}`);
      }

      const { size } = statSync(filePath);
      if (size > MAX_IMAGE_SIZE) {
        errors.push(`Image "${file}" exceeds 1 MB (${Math.round(size / 1024)} KB)`);
      }
      totalSize += size;
    }

    if (totalSize > MAX_TOTAL_SIZE) {
      errors.push(`Total image size exceeds 5 MB (${Math.round(totalSize / 1024)} KB)`);
    }
  }

  return errors;
}

function gitLines(cmd: string): string[] {
  try {
    return execSync(cmd, { encoding: "utf8" }).trim().split("\n").filter(Boolean);
  } catch {
    return [];
  }
}

function extractSlugs(lines: string[]): string[] {
  const slugs = new Set<string>();
  for (const line of lines) {
    const match = line.match(/^posts\/([^/]+)\//);
    if (match) slugs.add(match[1]);
  }
  return [...slugs];
}

/**
 * Detect the changed post slugs. In CI (pull_request) it diffs against the base
 * branch; locally it diffs the working tree (staged + unstaged + untracked).
 * Deleted posts are skipped (only slugs whose directory still exists are kept).
 */
function changedSlugs(): string[] {
  const base = process.env.GITHUB_BASE_REF;
  const lines = base
    ? gitLines(`git diff --name-only --diff-filter=ACMRT origin/${base}...HEAD -- posts/`)
    : [
        ...gitLines("git diff --name-only --diff-filter=A --cached -- posts/"),
        ...gitLines("git diff --name-only --diff-filter=CMRT --cached -- posts/"),
        ...gitLines("git diff --name-only --diff-filter=CMRT -- posts/"),
        ...gitLines("git ls-files --others --exclude-standard -- posts/"),
      ];
  return extractSlugs(lines).filter((slug) => existsSync(join("posts", slug)));
}

/**
 * Verify the post author is registered on the website. Runs only in CI where the
 * secret and website URL are provided; skipped (returns null) otherwise, and
 * network errors do not fail the PR. Returns an error message, or null when ok.
 */
async function checkAuthorRegistered(authorId: string): Promise<string | null> {
  const secret = process.env.BLOG_VALIDATE_SECRET;
  const websiteUrl = process.env.WEBSITE_URL;
  if (!secret || !websiteUrl) return null;

  try {
    const res = await fetch(`${websiteUrl}/api/blog/validate-author?githubId=${authorId}`, {
      headers: { Authorization: `Bearer ${secret}` },
    });
    if (res.status === 404) {
      const body = (await res.json().catch(() => null)) as { message?: string } | null;
      return body?.message ?? `Author ${authorId} is not registered on the website`;
    }
    if (!res.ok) return `Author check failed (HTTP ${res.status})`;
    return null;
  } catch {
    return null;
  }
}

/**
 * Validate changed blog posts. Detects the changes itself, checks frontmatter,
 * cover image, and image sizes, verifies the author is registered (in CI), and
 * throws when any post is invalid (which fails the check).
 */
export async function validate(): Promise<void> {
  const slugs = changedSlugs();
  if (slugs.length === 0) {
    console.log("No changed posts to validate.");
    return;
  }

  const prAuthorId = process.env.PR_AUTHOR_ID;
  let hasErrors = false;

  for (const slug of slugs) {
    const errors = validatePost(slug, prAuthorId);

    if (errors.length === 0) {
      const fm = parseFrontmatter(readFileSync(join("posts", slug, "index.mdx"), "utf-8"));
      const author = fm?.author;
      if (author && /^\d+$/.test(author)) {
        const authorError = await checkAuthorRegistered(author);
        if (authorError) errors.push(authorError);
      }
    }

    if (errors.length > 0) {
      hasErrors = true;
      console.error(`✗ ${slug}`);
      for (const err of errors) console.error(`    - ${err}`);
    } else {
      console.log(`✓ ${slug}`);
    }
  }

  if (hasErrors) throw new Error("Blog post validation failed. See the issues listed above.");
  console.log("\nAll validations passed!");
}
