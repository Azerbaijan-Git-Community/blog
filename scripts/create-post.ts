import { mkdirSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { createInterface } from "node:readline/promises";
import { fetchGitHubUser } from "./lib/github.ts";

const c = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
};

const green = (s: string) => `${c.green}${s}${c.reset}`;
const red = (s: string) => `${c.red}${s}${c.reset}`;
const cyan = (s: string) => `${c.cyan}${s}${c.reset}`;
const yellow = (s: string) => `${c.yellow}${s}${c.reset}`;
const bold = (s: string) => `${c.bold}${s}${c.reset}`;
const dim = (s: string) => `${c.dim}${s}${c.reset}`;

const SLUG_REGEX = /^[a-z0-9]+(-[a-z0-9]+)*$/;

const rl = createInterface({ input: process.stdin, output: process.stdout });

async function ask(question: string): Promise<string> {
  const answer = await rl.question(`${c.bold}${c.cyan}${question}${c.reset} `);
  return answer.trim();
}

async function main() {
  console.log(`\n${bold(cyan("Creating a new blog post..."))}\n`);

  // GitHub username → ID
  let authorId!: number;
  while (true) {
    const username = await ask("GitHub Username:");
    if (!username) {
      console.log(`  ${red("Username cannot be empty.")}\n`);
      continue;
    }
    process.stdout.write(dim("  Fetching GitHub ID..."));
    let user;
    try {
      user = await fetchGitHubUser(username);
    } catch (err) {
      console.log(`\n  ${red(err instanceof Error ? err.message : String(err))}\n`);
      continue;
    }
    if (!user) {
      console.log(`\n  ${red(`User "${username}" not found on GitHub. Try again.`)}\n`);
      continue;
    }
    authorId = user.id;
    console.log(` ${green("✓")}  ${cyan(`@${user.login}`)} ${dim(`→ ID: ${user.id}`)}\n`);
    break;
  }

  // Slug
  let slug!: string;
  while (true) {
    slug = await ask("Post Slug (e.g. my-awesome-post):");
    if (!SLUG_REGEX.test(slug)) {
      console.log(`  ${red("Slug must be lowercase letters, numbers, and hyphens only.")}\n`);
      continue;
    }
    if (existsSync(join("posts", slug))) {
      console.log(`  ${red(`A post with slug "${slug}" already exists.`)}\n`);
      continue;
    }
    break;
  }

  // Title
  let title!: string;
  while (true) {
    title = await ask("Post Title:");
    if (!title) {
      console.log(`  ${red("Title cannot be empty.")}\n`);
      continue;
    }
    break;
  }

  // Description
  let description!: string;
  while (true) {
    description = await ask("Post Description:");
    if (!description) {
      console.log(`  ${red("Description cannot be empty.")}\n`);
      continue;
    }
    break;
  }

  // Tags
  let tags!: string[];
  while (true) {
    const input = await ask("Tags (comma-separated, e.g. go, tutorial):");
    tags = input
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    if (tags.length === 0) {
      console.log(`  ${red("At least one tag is required.")}\n`);
      continue;
    }
    break;
  }

  rl.close();

  // Write files
  const postDir = join("posts", slug);
  mkdirSync(join(postDir, "images"), { recursive: true });

  const mdx = `---
title: "${title.replace(/"/g, '\\"')}"
description: "${description.replace(/"/g, '\\"')}"
tags: [${tags.join(", ")}]
author: ${authorId}
---

Write your post here...
`;

  writeFileSync(join(postDir, "index.mdx"), mdx);

  console.log(`\n${green("✓")} Created ${bold(`posts/${slug}/`)}`);
  console.log(`  ${yellow(`Next: add your cover image at posts/${slug}/images/cover.{png,jpg,jpeg,webp,svg}`)}`);
}

main().catch((err) => {
  console.error(red(String(err)));
  rl.close();
  process.exit(1);
});
