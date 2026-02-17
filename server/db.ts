import { getEnv } from "./src/env"
import knex from "knex"

export const db = knex({
  client: "mysql",
  connection: {
    host: getEnv("DATABASE_HOST"),
    port: getEnv("DATABASE_PORT") as unknown as number,
    user: getEnv("DATABASE_USER"),
    password: getEnv("DATABASE_PASSWORD"),
    database: getEnv("DATABASE_NAME"),
  },
})
