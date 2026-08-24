import { execSync } from "child_process"
import knex from "knex"
import path from "path"
import * as mysql from "mysql2/promise"

export default async function globalSetup() {
  console.log("[e2e globalSetup] Starting docker compose test DB...")
  try {
    execSync("docker compose -f docker-compose.test.yml up -d --wait", {
      stdio: "inherit",
      cwd: path.resolve("."),
    })
  } catch (e) {
    console.error("Failed to start docker compose", e)
    throw e
  }

  // Wait for DB to be ready and run migrations
  const maxAttempts = 15
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const k = knex({
        client: "mysql2",
        connection: {
          host: "127.0.0.1",
          port: 3307,
          database: "mefila_test",
          user: "mefila-test-user",
          password: "testpassword",
        },
      } as any)
      await k.raw("SELECT 1")
      await k.migrate.latest({ directory: path.resolve("server/migrations") })
      await k.destroy()
      console.log("[e2e globalSetup] DB ready and migrated")
      break
    } catch (e) {
      console.log(`[e2e globalSetup] DB not ready, retry ${i + 1}/${maxAttempts} ${(e as Error).message}`)
      await new Promise((r) => setTimeout(r, 2000))
      if (i === maxAttempts - 1) throw e
    }
  }

  // Clean DB before run
  try {
    const conn = await mysql.createConnection({
      host: "127.0.0.1",
      port: 3307,
      database: "mefila_test",
      user: "mefila-test-user",
      password: "testpassword",
    })
    await conn.query("DELETE FROM users")
    await conn.query("DELETE FROM rooms")
    await conn.end()
  } catch {}
}
