import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"

vi.mock("../../src/db", () => ({
  db: { execute: vi.fn() },
}))

import { db } from "../../src/db"
import { generateBase62, generateUniqueBase62 } from "../../src/utils/base62"

const mockedExecute = db.execute as unknown as ReturnType<typeof vi.fn>

describe("generateBase62", () => {
  it("returns a 5-char string of base62 characters", () => {
    const id = generateBase62()
    expect(id).toMatch(/^[0-9a-zA-Z]{5}$/)
  })

  it("uses Math.random to pick characters", () => {
    const randomSpy = vi.spyOn(Math, "random").mockReturnValue(0)
    expect(generateBase62()).toBe("00000")
    randomSpy.mockReturnValue(0.999999)
    expect(generateBase62()).toBe("ZZZZZ")
    randomSpy.mockRestore()
  })
})

describe("generateUniqueBase62", () => {
  beforeEach(() => {
    mockedExecute.mockReset()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("returns the first id when not taken", async () => {
    mockedExecute.mockResolvedValueOnce([[], []])
    const id = await generateUniqueBase62()
    expect(id).toMatch(/^[0-9a-zA-Z]{5}$/)
    expect(mockedExecute).toHaveBeenCalledTimes(1)
  })

  it("retries when the first id is taken", async () => {
    mockedExecute
      .mockResolvedValueOnce([[{ 1: 1 }], []])
      .mockResolvedValueOnce([[], []])
    const id = await generateUniqueBase62()
    expect(id).toMatch(/^[0-9a-zA-Z]{5}$/)
    expect(mockedExecute).toHaveBeenCalledTimes(2)
  })

  it("treats non-array result as collision and keeps trying", async () => {
    mockedExecute
      .mockResolvedValueOnce([null, []])
      .mockResolvedValueOnce([[], []])
    const id = await generateUniqueBase62()
    expect(id).toMatch(/^[0-9a-zA-Z]{5}$/)
    expect(mockedExecute).toHaveBeenCalledTimes(2)
  })

  it("throws after MAX_TRIES failures", async () => {
    mockedExecute.mockResolvedValue([[{ 1: 1 }], []])
    await expect(generateUniqueBase62()).rejects.toThrow(
      "Failed to generate a unique id"
    )
    expect(mockedExecute).toHaveBeenCalledTimes(5)
  })
})
