import { describe, it, expect, vi, beforeEach } from "vitest"

vi.mock("../../src/db", () => ({
  db: { execute: vi.fn() },
}))

import request from "supertest"
import { db } from "../../src/db"
import { buildApp, signUserToken, signHostToken } from "../helpers/app"

const mockedExecute = db.execute as unknown as ReturnType<typeof vi.fn>
const app = buildApp()

beforeEach(() => {
  mockedExecute.mockReset()
})

describe("POST /users (createUser)", () => {
  it("201 with user + accessToken", async () => {
    mockedExecute.mockResolvedValueOnce([{ affectedRows: 1 }, []])
    const res = await request(app).post("/users").send({ name: "Alice" })
    expect(res.status).toBe(201)
    expect(res.body.data.user.name).toBe("Alice")
    expect(typeof res.body.data.user.id).toBe("string")
    expect(typeof res.body.data.accessToken).toBe("string")
  })

  it("400 when name is missing", async () => {
    const res = await request(app).post("/users").send({})
    expect(res.status).toBe(400)
    expect(mockedExecute).not.toHaveBeenCalled()
  })

  it("400 when name is blank", async () => {
    const res = await request(app).post("/users").send({ name: "   " })
    expect(res.status).toBe(400)
    expect(mockedExecute).not.toHaveBeenCalled()
  })

  it("400 when insert affects no rows", async () => {
    mockedExecute.mockResolvedValueOnce([{ affectedRows: 0 }, []])
    const res = await request(app).post("/users").send({ name: "Alice" })
    expect(res.status).toBe(400)
  })
})

describe("GET /users/:id (getUser)", () => {
  it("401 without token", async () => {
    const res = await request(app).get("/users/u1")
    expect(res.status).toBe(401)
  })

  it("403 when host tries to access", async () => {
    const token = signHostToken("anything")
    const res = await request(app)
      .get("/users/u1")
      .set("Authorization", `Bearer ${token}`)
    expect(res.status).toBe(403)
  })

  it("404 when user not found", async () => {
    mockedExecute.mockResolvedValueOnce([[], []])
    const token = signUserToken("u1")
    const res = await request(app)
      .get("/users/u1")
      .set("Authorization", `Bearer ${token}`)
    expect(res.status).toBe(404)
  })

  it("200 when user found", async () => {
    mockedExecute.mockResolvedValueOnce([
      [{ id: "u1", name: "Alice", room_id: null }],
      [],
    ])
    const token = signUserToken("u1")
    const res = await request(app)
      .get("/users/u1")
      .set("Authorization", `Bearer ${token}`)
    expect(res.status).toBe(200)
    expect(res.body.data.id).toBe("u1")
  })

  it("includes queue position when user is in a room", async () => {
    mockedExecute
      .mockResolvedValueOnce([[{ id: "u1", name: "Alice", room_id: "abc" }], []])
      .mockResolvedValueOnce([[{ position: 3 }], []])
    const token = signUserToken("u1")
    const res = await request(app)
      .get("/users/u1")
      .set("Authorization", `Bearer ${token}`)
    expect(res.status).toBe(200)
    expect(res.body.data.position).toBe(3)
  })
})

describe("DELETE /users/:id (deleteUser)", () => {
  it("404 when user does not exist", async () => {
    mockedExecute.mockResolvedValueOnce([[], []])
    const token = signUserToken("u1")
    const res = await request(app)
      .delete("/users/u1")
      .set("Authorization", `Bearer ${token}`)
    expect(res.status).toBe(404)
  })

  it("200 when user deleted", async () => {
    mockedExecute
      .mockResolvedValueOnce([[{ id: "u1", name: "Alice" }], []])
      .mockResolvedValueOnce([{ affectedRows: 1 }, []])
    const token = signUserToken("u1")
    const res = await request(app)
      .delete("/users/u1")
      .set("Authorization", `Bearer ${token}`)
    expect(res.status).toBe(200)
  })
})
