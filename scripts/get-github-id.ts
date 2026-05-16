const username = process.argv[2];

if (!username) {
  console.error("Usage: pnpm get-github-id <username>");
  process.exit(1);
}

const res = await fetch(`https://api.github.com/users/${username}`);

if (res.status === 404) {
  console.error(`GitHub user "${username}" not found.`);
  process.exit(1);
}

if (!res.ok) {
  console.error(`GitHub API error: ${res.status} ${res.statusText}`);
  process.exit(1);
}

const data = (await res.json()) as { id: number; login: string };
console.log(`@${data.login} → GitHub ID: ${data.id}`);

export {};
