import * as mysql from "mysql2/promise"

export async function cleanDb() {
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
}
