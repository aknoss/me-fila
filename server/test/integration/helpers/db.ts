import { db } from "../../../src/db"

export async function cleanDb() {
  // Delete users first due to FK constraint
  await db.execute("DELETE FROM users")
  await db.execute("DELETE FROM rooms")
}

export async function closeDb() {
  await db.end()
}
