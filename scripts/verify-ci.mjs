// The shared workflow runs npm test and npm run build. Verify production routes
// after its build without modifying the organization-owned workflow.
import { spawnSync } from "node:child_process";
if (process.env.GITHUB_ACTIONS === "true") {
  for (const args of [["run", "test:integration"], ["audit", "--audit-level=high"]]) {
    const result = spawnSync("npm", args, { stdio: "inherit", env: process.env });
    if (result.error || result.status !== 0) process.exit(result.status || 1);
  }
}
