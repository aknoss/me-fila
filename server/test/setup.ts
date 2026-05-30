process.env.JWT_SECRET = process.env.JWT_SECRET ?? "test-secret"
process.env.DATABASE_HOST = process.env.DATABASE_HOST ?? "localhost"
process.env.DATABASE_PORT = process.env.DATABASE_PORT ?? "3306"
process.env.DATABASE_NAME = process.env.DATABASE_NAME ?? "test"
process.env.DATABASE_USER = process.env.DATABASE_USER ?? "test"
process.env.DATABASE_PASSWORD = process.env.DATABASE_PASSWORD ?? "test"

const { logger } = await import("../src/logger")
logger.silent = true
