import { fetchGitHubUser } from "./lib/github.ts";

const username = process.argv[2];

if (!username) {
  console.error("Usage: pnpm get-github-id <username>");
  process.exit(1);
}

try {
  const user = await fetchGitHubUser(username);
  if (!user) {
    console.error(`GitHub user "${username}" not found.`);
    process.exitCode = 1;
  } else {
    console.log(`@${user.login} → GitHub ID: ${user.id}`);
  }
} catch (err) {
  console.error(err instanceof Error ? err.message : String(err));
  process.exitCode = 1;
}
