import { describe, it, expect } from "vitest"
import { getEnv } from "../src/env"

describe("getEnv", () => {
  it("returns the value when set", () => {
    process.env.SOME_TEST_VAR = "hello"
    expect(getEnv("SOME_TEST_VAR")).toBe("hello")
    delete process.env.SOME_TEST_VAR
  })

  it("throws when missing", () => {
    delete process.env.SOME_MISSING_VAR
    expect(() => getEnv("SOME_MISSING_VAR")).toThrow(
      /SOME_MISSING_VAR is missing/
    )
  })
})
