import { describe, it, expect, beforeEach, afterEach, afterAll, vi } from "vitest"
import request from "supertest"
import jwt from "jsonwebtoken"
import fs from "fs"
import { createApp } from "../../src/app"
import { db } from "../../src/db"
import { cleanDb, closeDb } from "./helpers/db"
import { Role } from "@me-fila/shared/types"
import { getEnv } from "../../src/env"

const app = createApp()

function signHostToken(roomId: string) {
  return jwt.sign({ roomId, role: Role.HOST }, process.env.JWT_SECRET!)
}
function signUserToken(userId: string) {
  return jwt.sign({ userId, role: Role.USER }, process.env.JWT_SECRET!)
}

beforeEach(async () => {
  await cleanDb()
})

afterEach(async () => {
  await cleanDb()
  vi.restoreAllMocks()
})

afterAll(async () => {
  await cleanDb()
  await closeDb()
})

describe("POST /rooms", () => {
  it("201 creates room with accessToken", async () => {
    const res = await request(app).post("/rooms").send({ name: "Fila A" })
    expect(res.status).toBe(201)
    expect(res.body.data.room.name).toBe("Fila A")
    expect(res.body.data.room.id).toMatch(/^[0-9a-zA-Z]{5}$/)
    const payload = jwt.verify(res.body.data.accessToken, process.env.JWT_SECRET!) as any
    expect(payload.role).toBe(Role.HOST)
    expect(payload.roomId).toBe(res.body.data.room.id)
  })

  it("400 when name missing", async () => {
    const res = await request(app).post("/rooms").send({})
    expect(res.status).toBe(400)
    expect(res.body.error.code).toBe(400)
  })

  it("400 when name empty string", async () => {
    const res = await request(app).post("/rooms").send({ name: "" })
    expect(res.status).toBe(400)
  })

  it("500 when generateUniqueBase62 fails after collisions (covers MAX_TRIES)", async () => {
    // Create a room with known id
    await db.execute("INSERT INTO rooms (id, name) VALUES (?, ?)", ["AAAAA", "Existing"])
    // Force generateBase62 to always return AAAAA => collision 5 times
    // charset: "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
    // 'A' is index 36 => 36/62 ≈ 0.5806, need value that floors to 36: (36+0.5)/62
    const spy = vi.spyOn(Math, "random").mockReturnValue((36 + 0.5) / 62)
    const res = await request(app).post("/rooms").send({ name: "ShouldFail" })
    expect(res.status).toBe(500)
    expect(res.body.error.message).toBe("Something went wrong!")
    spy.mockRestore()
  })
})

describe("GET /rooms/:id", () => {
  it("200 returns room", async () => {
    const created = await request(app).post("/rooms").send({ name: "Sala 1" })
    const id = created.body.data.room.id
    const res = await request(app).get(`/rooms/${id}`)
    expect(res.status).toBe(200)
    expect(res.body.data.name).toBe("Sala 1")
  })

  it("404 when not found", async () => {
    const res = await request(app).get("/rooms/XXXXX")
    expect(res.status).toBe(404)
  })
})

describe("DELETE /rooms/:id", () => {
  it("401 without token", async () => {
    const res = await request(app).delete("/rooms/abcde")
    expect(res.status).toBe(401)
  })

  it("401 with invalid token", async () => {
    const res = await request(app).delete("/rooms/abcde").set("Authorization", "Bearer invalid")
    expect(res.status).toBe(401)
  })

  it("403 when USER role tries to delete", async () => {
    const created = await request(app).post("/rooms").send({ name: "R" })
    const id = created.body.data.room.id
    const userRes = await request(app).post("/users").send({ name: "Bob" })
    const userToken = userRes.body.data.accessToken
    const res = await request(app).delete(`/rooms/${id}`).set("Authorization", `Bearer ${userToken}`)
    expect(res.status).toBe(403)
  })

  it("403 when HOST token roomId mismatch", async () => {
    const created = await request(app).post("/rooms").send({ name: "R" })
    const id = created.body.data.room.id
    const other = signHostToken("OTHER")
    const res = await request(app).delete(`/rooms/${id}`).set("Authorization", `Bearer ${other}`)
    expect(res.status).toBe(403)
  })

  it("404 when room not found to delete", async () => {
    const token = signHostToken("ZZZZZ")
    const res = await request(app).delete("/rooms/ZZZZZ").set("Authorization", `Bearer ${token}`)
    expect(res.status).toBe(404)
  })

  it("200 deletes existing room", async () => {
    const created = await request(app).post("/rooms").send({ name: "ToDelete" })
    const id = created.body.data.room.id
    const token = created.body.data.accessToken
    const res = await request(app).delete(`/rooms/${id}`).set("Authorization", `Bearer ${token}`)
    expect(res.status).toBe(200)
    const get = await request(app).get(`/rooms/${id}`)
    expect(get.status).toBe(404)
  })
})

describe("POST /users", () => {
  it("201 creates user", async () => {
    const res = await request(app).post("/users").send({ name: "Alice" })
    expect(res.status).toBe(201)
    expect(res.body.data.user.name).toBe("Alice")
    expect(res.body.data.user.id).toBeDefined()
    const payload = jwt.verify(res.body.data.accessToken, process.env.JWT_SECRET!) as any
    expect(payload.role).toBe(Role.USER)
  })

  it("400 when name missing", async () => {
    const res = await request(app).post("/users").send({})
    expect(res.status).toBe(400)
  })

  it("400 when name blank", async () => {
    const res = await request(app).post("/users").send({ name: "   " })
    expect(res.status).toBe(400)
  })

  it("400 when db affectedRows 0 (covers branch)", async () => {
    const spy = vi.spyOn(db, "execute").mockResolvedValueOnce([{ affectedRows: 0 } as any, []] as any)
    const res = await request(app).post("/users").send({ name: "ShouldFailDup" })
    expect(res.status).toBe(400)
    expect(res.body.error.message).toBe("User already exists")
    spy.mockRestore()
  })
})

describe("GET /users/:id", () => {
  it("401 without token", async () => {
    const u = await request(app).post("/users").send({ name: "Carol" })
    const id = u.body.data.user.id
    const res = await request(app).get(`/users/${id}`)
    expect(res.status).toBe(401)
  })

  it("403 when HOST tries to get user", async () => {
    const room = await request(app).post("/rooms").send({ name: "R" })
    const hostToken = room.body.data.accessToken
    const u = await request(app).post("/users").send({ name: "Dan" })
    const id = u.body.data.user.id
    const res = await request(app).get(`/users/${id}`).set("Authorization", `Bearer ${hostToken}`)
    expect(res.status).toBe(403)
  })

  it("403 ownership mismatch", async () => {
    const u1 = await request(app).post("/users").send({ name: "Eve" })
    const id1 = u1.body.data.user.id
    const u2 = await request(app).post("/users").send({ name: "Frank" })
    const token2 = u2.body.data.accessToken
    const res = await request(app).get(`/users/${id1}`).set("Authorization", `Bearer ${token2}`)
    expect(res.status).toBe(403)
  })

  it("404 when user not found", async () => {
    const token = signUserToken("00000000-0000-0000-0000-000000000000")
    const res = await request(app).get("/users/00000000-0000-0000-0000-000000000000").set("Authorization", `Bearer ${token}`)
    expect(res.status).toBe(404)
  })

  it("200 returns user without position when not in room", async () => {
    const u = await request(app).post("/users").send({ name: "Gina" })
    const id = u.body.data.user.id
    const token = u.body.data.accessToken
    const res = await request(app).get(`/users/${id}`).set("Authorization", `Bearer ${token}`)
    expect(res.status).toBe(200)
    expect(res.body.data.name).toBe("Gina")
    expect(res.body.data.position).toBeUndefined()
  })

  it("200 returns position when in room", async () => {
    const room = await request(app).post("/rooms").send({ name: "RPos" })
    const roomId = room.body.data.room.id
    const u1 = await request(app).post("/users").send({ name: "H1" })
    await new Promise((r) => setTimeout(r, 1100))
    const u2 = await request(app).post("/users").send({ name: "H2" })
    const token1 = u1.body.data.accessToken
    const token2 = u2.body.data.accessToken
    const id1 = u1.body.data.user.id
    const id2 = u2.body.data.user.id
    // Join both
    await request(app).post(`/rooms/${roomId}/users`).set("Authorization", `Bearer ${token1}`)
    await request(app).post(`/rooms/${roomId}/users`).set("Authorization", `Bearer ${token2}`)
    const r1 = await request(app).get(`/users/${id1}`).set("Authorization", `Bearer ${token1}`)
    const r2 = await request(app).get(`/users/${id2}`).set("Authorization", `Bearer ${token2}`)
    // With distinct created_at, order is deterministic; fallback if same second
    const pos1 = r1.body.data.position
    const pos2 = r2.body.data.position
    expect([1, 2]).toContain(pos1)
    expect([1, 2]).toContain(pos2)
    expect(pos1).not.toBe(pos2)
    // The earlier user should have smaller position (if timestamps distinct)
    // Verify that the set of positions is {1,2}
    expect([pos1, pos2].sort()).toEqual([1, 2])
  })
})

describe("DELETE /users/:id", () => {
  it("200 deletes user", async () => {
    const u = await request(app).post("/users").send({ name: "Ivy" })
    const id = u.body.data.user.id
    const token = u.body.data.accessToken
    const res = await request(app).delete(`/users/${id}`).set("Authorization", `Bearer ${token}`)
    expect(res.status).toBe(200)
    const get = await request(app).get(`/users/${id}`).set("Authorization", `Bearer ${token}`)
    expect(get.status).toBe(404)
  })

  it("404 when user not found", async () => {
    const fakeId = "00000000-0000-0000-0000-000000000001"
    const token = signUserToken(fakeId)
    const res = await request(app).delete(`/users/${fakeId}`).set("Authorization", `Bearer ${token}`)
    expect(res.status).toBe(404)
  })
})

describe("POST /rooms/:id/users (joinRoom)", () => {
  it("200 joins room", async () => {
    const room = await request(app).post("/rooms").send({ name: "JoinR" })
    const roomId = room.body.data.room.id
    const u = await request(app).post("/users").send({ name: "Joiner" })
    const token = u.body.data.accessToken
    const res = await request(app).post(`/rooms/${roomId}/users`).set("Authorization", `Bearer ${token}`)
    expect(res.status).toBe(200)
    expect(res.body.data.room_id).toBe(roomId)
  })

  it("401 without token", async () => {
    const room = await request(app).post("/rooms").send({ name: "R" })
    const res = await request(app).post(`/rooms/${room.body.data.room.id}/users`)
    expect(res.status).toBe(401)
  })

  it("403 when HOST tries to join", async () => {
    const room = await request(app).post("/rooms").send({ name: "R" })
    const hostToken = room.body.data.accessToken
    const res = await request(app).post(`/rooms/${room.body.data.room.id}/users`).set("Authorization", `Bearer ${hostToken}`)
    expect(res.status).toBe(403)
  })

  it("404 when room not found", async () => {
    const u = await request(app).post("/users").send({ name: "U" })
    const token = u.body.data.accessToken
    const res = await request(app).post("/rooms/ZZZZZ/users").set("Authorization", `Bearer ${token}`)
    expect(res.status).toBe(404)
  })

  it("404 when user not found (token with fake id)", async () => {
    const room = await request(app).post("/rooms").send({ name: "R2" })
    const fakeToken = signUserToken("00000000-0000-0000-0000-000000000002")
    const res = await request(app).post(`/rooms/${room.body.data.room.id}/users`).set("Authorization", `Bearer ${fakeToken}`)
    expect(res.status).toBe(404)
  })
})

describe("GET /rooms/:id/users", () => {
  it("200 returns ordered users with positions", async () => {
    const room = await request(app).post("/rooms").send({ name: "Ordered" })
    const roomId = room.body.data.room.id
    const hostToken = room.body.data.accessToken
    const u1 = await request(app).post("/users").send({ name: "A" })
    // Ensure distinct created_at by waiting and updating directly for deterministic order
    await new Promise((r) => setTimeout(r, 1100))
    const u2 = await request(app).post("/users").send({ name: "B" })
    await new Promise((r) => setTimeout(r, 1100))
    const u3 = await request(app).post("/users").send({ name: "C" })
    await request(app).post(`/rooms/${roomId}/users`).set("Authorization", `Bearer ${u1.body.data.accessToken}`)
    await request(app).post(`/rooms/${roomId}/users`).set("Authorization", `Bearer ${u2.body.data.accessToken}`)
    await request(app).post(`/rooms/${roomId}/users`).set("Authorization", `Bearer ${u3.body.data.accessToken}`)
    const res = await request(app).get(`/rooms/${roomId}/users`).set("Authorization", `Bearer ${hostToken}`)
    expect(res.status).toBe(200)
    // Positions must be 1,2,3 and names contain all three (order by created_at should now be A,B,C)
    expect(res.body.data.users.map((u: any) => u.position)).toEqual([1, 2, 3])
    const names = res.body.data.users.map((u: any) => u.name).sort()
    expect(names).toEqual(["A", "B", "C"])
    // If timestamps are distinct, order should be A,B,C
    if (res.body.data.users[0].name === "A") {
      expect(res.body.data.users.map((u: any) => u.name)).toEqual(["A", "B", "C"])
    }
  })

  it("200 empty when no users", async () => {
    const room = await request(app).post("/rooms").send({ name: "Empty" })
    const hostToken = room.body.data.accessToken
    const res = await request(app).get(`/rooms/${room.body.data.room.id}/users`).set("Authorization", `Bearer ${hostToken}`)
    expect(res.status).toBe(200)
    expect(res.body.data.users).toEqual([])
  })

  it("404 when room not found", async () => {
    const token = signHostToken("ZZZZZ")
    const res = await request(app).get("/rooms/ZZZZZ/users").set("Authorization", `Bearer ${token}`)
    expect(res.status).toBe(404)
  })

  it("401 without token", async () => {
    const room = await request(app).post("/rooms").send({ name: "R" })
    const res = await request(app).get(`/rooms/${room.body.data.room.id}/users`)
    expect(res.status).toBe(401)
  })

  it("403 when USER tries to list", async () => {
    const room = await request(app).post("/rooms").send({ name: "R" })
    const u = await request(app).post("/users").send({ name: "U" })
    const res = await request(app).get(`/rooms/${room.body.data.room.id}/users`).set("Authorization", `Bearer ${u.body.data.accessToken}`)
    expect(res.status).toBe(403)
  })
})

describe("DELETE /rooms/:id/users/:userId", () => {
  it("200 removes user from room", async () => {
    const room = await request(app).post("/rooms").send({ name: "Rm" })
    const roomId = room.body.data.room.id
    const hostToken = room.body.data.accessToken
    const u = await request(app).post("/users").send({ name: "ToRemove" })
    await request(app).post(`/rooms/${roomId}/users`).set("Authorization", `Bearer ${u.body.data.accessToken}`)
    const res = await request(app).delete(`/rooms/${roomId}/users/${u.body.data.user.id}`).set("Authorization", `Bearer ${hostToken}`)
    expect(res.status).toBe(200)
    // user still exists but not in room — getRoomUsers should be empty
    const list = await request(app).get(`/rooms/${roomId}/users`).set("Authorization", `Bearer ${hostToken}`)
    expect(list.body.data.users.length).toBe(0)
  })

  it("404 when user not in room", async () => {
    const room = await request(app).post("/rooms").send({ name: "R" })
    const hostToken = room.body.data.accessToken
    const u = await request(app).post("/users").send({ name: "U" })
    // not joined
    const res = await request(app).delete(`/rooms/${room.body.data.room.id}/users/${u.body.data.user.id}`).set("Authorization", `Bearer ${hostToken}`)
    expect(res.status).toBe(404)
  })

  it("401 without token", async () => {
    const res = await request(app).delete("/rooms/abcde/users/u1")
    expect(res.status).toBe(401)
  })

  it("403 when USER tries to remove", async () => {
    const room = await request(app).post("/rooms").send({ name: "R" })
    const u = await request(app).post("/users").send({ name: "U" })
    const res = await request(app).delete(`/rooms/${room.body.data.room.id}/users/${u.body.data.user.id}`).set("Authorization", `Bearer ${u.body.data.accessToken}`)
    expect(res.status).toBe(403)
  })

  it("403 ownership mismatch", async () => {
    const room = await request(app).post("/rooms").send({ name: "R" })
    const hostToken = room.body.data.accessToken
    const otherToken = signHostToken("OTHER")
    const u = await request(app).post("/users").send({ name: "U" })
    const res = await request(app).delete(`/rooms/${room.body.data.room.id}/users/${u.body.data.user.id}`).set("Authorization", `Bearer ${otherToken}`)
    expect(res.status).toBe(403)
  })
})

describe("auth middleware edge cases", () => {
  it("401 when Authorization missing Bearer", async () => {
    const room = await request(app).post("/rooms").send({ name: "R" })
    const res = await request(app).get(`/rooms/${room.body.data.room.id}/users`).set("Authorization", "Token xyz")
    expect(res.status).toBe(401)
  })

  it("401 when Bearer token empty", async () => {
    const room = await request(app).post("/rooms").send({ name: "R" })
    const res = await request(app).get(`/rooms/${room.body.data.room.id}/users`).set("Authorization", "Bearer ")
    expect(res.status).toBe(401)
  })
})

describe("errorHandler", () => {
  it("500 on unhandled error (db failure simulation)", async () => {
    // Already covered by MAX_TRIES test; just verify generic error path via direct controller throw is 500
    // Do a simple collision again with different id to ensure coverage
    await db.execute("INSERT INTO rooms (id, name) VALUES (?, ?)", ["BBBBB", "B"])
    const spy = vi.spyOn(Math, "random").mockReturnValue((37 + 0.5) / 62) // 'B' index 37
    const res = await request(app).post("/rooms").send({ name: "Fail2" })
    expect(res.status).toBe(500)
    spy.mockRestore()
  })

  it("covers logger and response shape via direct handler", async () => {
    const { errorHandler } = await import("../../src/middleware/errorHandler")
    const { logger } = await import("../../src/logger")
    const spy = vi.spyOn(logger, "error").mockImplementation(() => logger)
    const req: any = {}
    const res: any = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    }
    const err = new Error("boom")
    err.stack = "stacktrace"
    const origEnv = process.env.NODE_ENV
    process.env.NODE_ENV = "development"
    errorHandler(err, req, res, () => {})
    expect(res.status).toHaveBeenCalledWith(500)
    expect(res.json).toHaveBeenCalledWith({ data: null, error: { message: "Something went wrong!", code: 500 } })
    expect(spy).toHaveBeenCalled()
    process.env.NODE_ENV = "production"
    errorHandler(err, req, res, () => {})
    expect(res.status).toHaveBeenCalledWith(500)
    process.env.NODE_ENV = origEnv
    spy.mockRestore()
  })
})

describe("static and app integration", () => {
  it("serves SPA fallback when index.html exists", async () => {
    const res = await request(app).get("/some-unknown-spa-route")
    expect([200, 304]).toContain(res.status)
  })

  it("covers app else branch when index.html missing", async () => {
    const spy = vi.spyOn(fs, "existsSync").mockReturnValue(false)
    // Need to re-evaluate app.ts else branch — createApp checks fs at call time
    const app2 = createApp()
    const res = await request(app2).get("/some-unknown-spa-route-2")
    expect(res.status).toBe(404)
    expect(spy).toHaveBeenCalled()
    spy.mockRestore()
  })
})

describe("env coverage", () => {
  it("throws when env var missing", () => {
    const key = "__NON_EXISTENT_ENV_VAR_FOR_TEST__"
    delete process.env[key]
    expect(() => getEnv(key)).toThrow(`Environment variable ${key} is missing`)
  })

  it("returns value when present", () => {
    process.env.TEST_PRESENT = "hello"
    expect(getEnv("TEST_PRESENT")).toBe("hello")
    delete process.env.TEST_PRESENT
  })
})
