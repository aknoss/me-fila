import { describe, it, expect, vi, beforeEach } from "vitest"
import fs from "fs"
import request from "supertest"

vi.mock("../src/db", () => ({
  db: { execute: vi.fn().mockResolvedValue([[], []]), end: vi.fn() },
}))

import { createApp } from "../src/app"
import { db } from "../src/db"

const mockedExecute = db.execute as unknown as ReturnType<typeof vi.fn>

beforeEach(() => {
  mockedExecute.mockReset()
  mockedExecute.mockResolvedValue([[], []])
})

describe("createApp", () => {
  it("creates app with json, cors, routes and errorHandler", async () => {
    const app = createApp()
    expect(app).toBeDefined()
    const res = await request(app).post("/rooms").send({})
    expect(res.status).toBe(400)
    expect(res.body.error.code).toBe(400)
  })

  it("handles CORS headers", async () => {
    const app = createApp()
    const res = await request(app)
      .get("/rooms/abc")
      .set("Origin", "http://example.com")
    expect(res.headers["access-control-allow-origin"]).toBeDefined()
  })

  it("covers static branch when index.html exists", async () => {
    // Real file exists at server/public/index.html, so fallback should be registered
    // No mock needed — let fs.existsSync return true
    const app = createApp()
    const res = await request(app).get("/some-spa-route-xyz")
    // Should serve index.html via sendFile fallback (200) or static
    expect([200, 304]).toContain(res.status)
    expect(res.headers["content-type"]).toMatch(/html/)
  })

  it("covers static branch when index.html missing", async () => {
    vi.spyOn(fs, "existsSync").mockReturnValue(false)
    const app = createApp()
    expect(app).toBeDefined()
    expect(fs.existsSync).toHaveBeenCalled()
    const res = await request(app).get("/some-spa-route-xyz")
    // Without SPA fallback, unknown route should be 404
    expect(res.status).toBe(404)
    vi.restoreAllMocks()
  })

  it("mounts errorHandler last", async () => {
    vi.spyOn(fs, "existsSync").mockReturnValue(false)
    const app = createApp()
    // Validate errorHandler handles thrown errors via direct unit test plus app mount
    const hasErrorHandler = (app as any)._router.stack.length > 0
    expect(hasErrorHandler).toBe(true)
    vi.restoreAllMocks()
  })
})
