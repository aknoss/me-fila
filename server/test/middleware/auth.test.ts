import { describe, it, expect, vi, beforeEach } from "vitest"
import jwt from "jsonwebtoken"
import { authenticate, authorize } from "../../src/middleware/auth"
import { Role } from "@me-fila/shared/types"
import type { Request, Response, NextFunction } from "express"

function buildRes() {
  const res = {} as Response & { _status?: number; _json?: unknown }
  res.status = vi.fn(function (this: typeof res, code: number) {
    this._status = code
    return this
  }) as unknown as Response["status"]
  res.json = vi.fn(function (this: typeof res, body: unknown) {
    this._json = body
    return this
  }) as unknown as Response["json"]
  return res
}

describe("authenticate", () => {
  let next: NextFunction
  beforeEach(() => {
    next = vi.fn()
  })

  it("rejects when authorization header is missing", () => {
    const req = { headers: {} } as Request
    const res = buildRes()
    authenticate(req, res, next)
    expect(res.status).toHaveBeenCalledWith(401)
    expect(next).not.toHaveBeenCalled()
  })

  it("rejects when authorization header lacks Bearer", () => {
    const req = { headers: { authorization: "Token abc" } } as Request
    const res = buildRes()
    authenticate(req, res, next)
    expect(res.status).toHaveBeenCalledWith(401)
    expect(next).not.toHaveBeenCalled()
  })

  it("attaches roomId/role on a valid HOST token", () => {
    const token = jwt.sign(
      { roomId: "room1", role: Role.HOST },
      process.env.JWT_SECRET!
    )
    const req = {
      headers: { authorization: `Bearer ${token}` },
    } as Request
    const res = buildRes()
    authenticate(req, res, next)
    expect(req.roomId).toBe("room1")
    expect(req.role).toBe(Role.HOST)
    expect(next).toHaveBeenCalled()
  })

  it("attaches userId/role on a valid USER token", () => {
    const token = jwt.sign(
      { userId: "user1", role: Role.USER },
      process.env.JWT_SECRET!
    )
    const req = {
      headers: { authorization: `Bearer ${token}` },
    } as Request
    const res = buildRes()
    authenticate(req, res, next)
    expect(req.userId).toBe("user1")
    expect(req.role).toBe(Role.USER)
    expect(next).toHaveBeenCalled()
  })

  it("rejects when the token is invalid", () => {
    const req = {
      headers: { authorization: "Bearer not-a-real-token" },
    } as Request
    const res = buildRes()
    authenticate(req, res, next)
    expect(res.status).toHaveBeenCalledWith(401)
    expect(next).not.toHaveBeenCalled()
  })
})

describe("authorize", () => {
  let next: NextFunction
  beforeEach(() => {
    next = vi.fn()
  })

  it("forbids when role does not match", () => {
    const handler = authorize(Role.HOST)
    const req = { role: Role.USER, params: {} } as unknown as Request
    const res = buildRes()
    handler(req, res, next)
    expect(res.status).toHaveBeenCalledWith(403)
    expect(next).not.toHaveBeenCalled()
  })

  it("passes when role matches and no ownership check", () => {
    const handler = authorize(Role.HOST)
    const req = { role: Role.HOST, params: {} } as unknown as Request
    const res = buildRes()
    handler(req, res, next)
    expect(next).toHaveBeenCalled()
  })

  it("forbids when ownership roomId mismatch", () => {
    const handler = authorize(Role.HOST, "roomId")
    const req = {
      role: Role.HOST,
      roomId: "abc",
      params: { id: "xyz" },
    } as unknown as Request
    const res = buildRes()
    handler(req, res, next)
    expect(res.status).toHaveBeenCalledWith(403)
    expect(next).not.toHaveBeenCalled()
  })

  it("passes when ownership roomId matches", () => {
    const handler = authorize(Role.HOST, "roomId")
    const req = {
      role: Role.HOST,
      roomId: "abc",
      params: { id: "abc" },
    } as unknown as Request
    const res = buildRes()
    handler(req, res, next)
    expect(next).toHaveBeenCalled()
  })

  it("forbids when ownership userId mismatch", () => {
    const handler = authorize(Role.USER, "userId")
    const req = {
      role: Role.USER,
      userId: "u1",
      params: { id: "u2" },
    } as unknown as Request
    const res = buildRes()
    handler(req, res, next)
    expect(res.status).toHaveBeenCalledWith(403)
    expect(next).not.toHaveBeenCalled()
  })

  it("passes when ownership userId matches", () => {
    const handler = authorize(Role.USER, "userId")
    const req = {
      role: Role.USER,
      userId: "u1",
      params: { id: "u1" },
    } as unknown as Request
    const res = buildRes()
    handler(req, res, next)
    expect(next).toHaveBeenCalled()
  })
})
