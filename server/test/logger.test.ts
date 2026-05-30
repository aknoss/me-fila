import { describe, it, expect } from "vitest"
import { logger } from "../src/logger"

describe("logger module", () => {
  it("creates a winston logger with info level", () => {
    expect(logger).toBeDefined()
    expect(logger.level).toBe("info")
    expect(typeof logger.error).toBe("function")
  })
})
