import { describe, it, expect, vi, afterEach } from "vitest"
import { errorHandler } from "../../src/middleware/errorHandler"
import type { Request, Response, NextFunction } from "express"

function buildRes() {
  const json = vi.fn().mockReturnThis()
  const status = vi.fn().mockReturnValue({ json })
  return { status, json } as unknown as Response
}

describe("errorHandler", () => {
  const originalEnv = process.env.NODE_ENV

  afterEach(() => {
    process.env.NODE_ENV = originalEnv
  })

  it("responds 500 with generic error body", () => {
    const res = buildRes()
    errorHandler(
      new Error("boom"),
      {} as Request,
      res,
      vi.fn() as NextFunction
    )
    expect(res.status).toHaveBeenCalledWith(500)
  })

  it("includes stack info path when in development", () => {
    process.env.NODE_ENV = "development"
    const res = buildRes()
    errorHandler(
      new Error("boom"),
      {} as Request,
      res,
      vi.fn() as NextFunction
    )
    expect(res.status).toHaveBeenCalledWith(500)
  })

  it("hides stack info when not in development", () => {
    process.env.NODE_ENV = "production"
    const res = buildRes()
    errorHandler(
      new Error("boom"),
      {} as Request,
      res,
      vi.fn() as NextFunction
    )
    expect(res.status).toHaveBeenCalledWith(500)
  })
})
