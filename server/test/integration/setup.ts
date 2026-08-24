process.env.JWT_SECRET = process.env.JWT_SECRET ?? "test-secret-integration"
process.env.DATABASE_HOST = process.env.DATABASE_HOST ?? "127.0.0.1"
process.env.DATABASE_PORT = process.env.DATABASE_PORT ?? "3307"
process.env.DATABASE_NAME = process.env.DATABASE_NAME ?? "mefila_test"
process.env.DATABASE_USER = process.env.DATABASE_USER ?? "mefila-test-user"
process.env.DATABASE_PASSWORD = process.env.DATABASE_PASSWORD ?? "testpassword"

const { logger } = await import("../../src/logger")
logger.silent = true

// Ensure db pool is created after env is set (dynamic import forces re-evaluation)
// Import side-effect to initialize db with correct env
await import("../../src/db")

// Run migrations if DB is reachable; ignore if not (tests will fail with clear error)
try {
  const knex = (await import("knex")).default
  const config = (await import("../../knexfile.js")).default
  const k = knex({
    client: "mysql2",
    connection: {
      host: process.env.DATABASE_HOST,
      port: Number(process.env.DATABASE_PORT),
      database: process.env.DATABASE_NAME,
      user: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
    },
    migrations: { directory: "./migrations" },
  } as any)
  await k.migrate.latest()
  await k.destroy()
} catch (e) {
  // Allow tests to surface connection errors
  console.warn("[integration setup] migrate failed:", (e as Error).message)
}
