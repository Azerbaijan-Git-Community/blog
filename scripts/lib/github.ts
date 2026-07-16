import { execSync } from "node:child_process";

export type GitHubUser = { id: number; login: string };

let cachedToken: string | undefined | null = null;

export function getGitHubToken(): string | undefined {
  if (cachedToken !== null) return cachedToken;

  const envToken = process.env.GITHUB_TOKEN ?? process.env.GH_TOKEN;
  if (envToken) return (cachedToken = envToken);

  try {
    const token = execSync("gh auth token", { stdio: ["ignore", "pipe", "ignore"] })
      .toString()
      .trim();
    if (token) return (cachedToken = token);
  } catch {
    // gh not installed or not logged in
  }

  console.warn(
    "Warning: no GitHub token found — using unauthenticated API (60 requests/hour per IP).\n" +
      "Install GitHub CLI (https://cli.github.com) and run `gh auth login` to avoid rate limits.",
  );
  return (cachedToken = undefined);
}

export async function fetchGitHubUser(username: string): Promise<GitHubUser | null> {
  const token = getGitHubToken();
  const res = await fetch(`https://api.github.com/users/${username}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });

  if (res.status === 404) return null;

  if (!res.ok) {
    let message = `GitHub API error: ${res.status} ${res.statusText}`;
    const reset = res.headers.get("x-ratelimit-reset");
    if ((res.status === 403 || res.status === 429) && reset) {
      message += ` (rate limit resets at ${new Date(Number(reset) * 1000).toLocaleTimeString()})`;
    }
    throw new Error(message);
  }

  return (await res.json()) as GitHubUser;
}
