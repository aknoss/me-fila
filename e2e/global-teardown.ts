import { execSync } from "child_process"
import path from "path"

export default async function globalTeardown() {
  console.log("[e2e globalTeardown] Stopping docker compose test DB...")
  try {
    execSync("docker compose -f docker-compose.test.yml down -v", {
      stdio: "inherit",
      cwd: path.resolve("."),
    })
  } catch (e) {
    console.error("Failed to stop docker compose", e)
  }
}
