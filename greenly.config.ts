import { defineConfig } from "greenly";
import { validate } from "./scripts/validate";

export default defineConfig({
  name: "Azerbaijan GitHub Community - Blog",
  checks: [
    { name: "TypeScript", command: "pnpm tsc --noEmit" },
    { name: "Oxfmt", command: "pnpm fmt:check", onFail: "pnpm fmt" },
    { name: "Validate Posts", command: validate },
  ],
});
