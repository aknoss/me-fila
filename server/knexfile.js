import dotenv from "dotenv"

dotenv.config()

export default {
  client: "mysql2",
  connection: {
    host: process.env.DATABASE_HOST,
    port: Number(process.env.DATABASE_PORT),
    database: process.env.DATABASE_NAME,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
  },
  migrations: {
    directory: "./migrations",
  },
}
