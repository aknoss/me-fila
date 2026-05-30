import { describe, it, expect } from "vitest"
import { db } from "../src/db"

describe("db module", () => {
  it("exports a mysql pool with an execute method", () => {
    expect(db).toBeDefined()
    expect(typeof db.execute).toBe("function")
  })
})
