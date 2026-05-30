import { describe, it, expect } from "vitest"
import { getEnv } from "../src/env"

describe("client getEnv", () => {
  it("returns existing env var", () => {
    expect(getEnv("VITE_BACKEND_URL")).toBe("http://test.local")
  })

  it("throws when env var is missing", () => {
    expect(() => getEnv("VITE_DEFINITELY_NOT_SET")).toThrow(
      /VITE_DEFINITELY_NOT_SET is missing/
    )
  })
})
