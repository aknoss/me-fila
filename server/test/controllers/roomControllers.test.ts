import { describe, it, expect, vi, beforeEach } from "vitest"

vi.mock("../../src/db", () => ({
  db: { execute: vi.fn() },
}))

import request from "supertest"
import { db } from "../../src/db"
import { buildApp, signHostToken, signUserToken } from "../helpers/app"

const mockedExecute = db.execute as unknown as ReturnType<typeof vi.fn>
const app = buildApp()

beforeEach(() => {
  mockedExecute.mockReset()
})

describe("POST /rooms (createRoom)", () => {
  it("400 when name is missing", async () => {
    const res = await request(app).post("/rooms").send({})
    expect(res.status).toBe(400)
    expect(res.body.error.code).toBe(400)
  })

  it("201 with room + accessToken on success", async () => {
    // generateUniqueBase62 -> empty rows means free id
    mockedExecute
      .mockResolvedValueOnce([[], []]) // unique-id lookup
      .mockResolvedValueOnce([{ affectedRows: 1 }, []]) // insert
    const res = await request(app).post("/rooms").send({ name: "My Room" })
    expect(res.status).toBe(201)
    expect(res.body.data.room.name).toBe("My Room")
    expect(typeof res.body.data.accessToken).toBe("string")
  })
})

describe("DELETE /rooms/:id (deleteRoom)", () => {
  it("401 without a token", async () => {
    const res = await request(app).delete("/rooms/abc")
    expect(res.status).toBe(401)
  })

  it("403 when token roomId does not match the route param", async () => {
    const token = signHostToken("other-room")
    const res = await request(app)
      .delete("/rooms/abc")
      .set("Authorization", `Bearer ${token}`)
    expect(res.status).toBe(403)
  })

  it("403 when role is USER, not HOST", async () => {
    const token = signUserToken("abc")
    const res = await request(app)
      .delete("/rooms/abc")
      .set("Authorization", `Bearer ${token}`)
    expect(res.status).toBe(403)
  })

  it("404 when no rows are deleted", async () => {
    mockedExecute.mockResolvedValueOnce([{ affectedRows: 0 }, []])
    const token = signHostToken("abc")
    const res = await request(app)
      .delete("/rooms/abc")
      .set("Authorization", `Bearer ${token}`)
    expect(res.status).toBe(404)
  })

  it("200 on successful delete", async () => {
    mockedExecute.mockResolvedValueOnce([{ affectedRows: 1 }, []])
    const token = signHostToken("abc")
    const res = await request(app)
      .delete("/rooms/abc")
      .set("Authorization", `Bearer ${token}`)
    expect(res.status).toBe(200)
    expect(res.body.error).toBeNull()
  })
})

describe("GET /rooms/:id/users (getRoomUsers)", () => {
  it("404 when room does not exist", async () => {
    mockedExecute.mockResolvedValueOnce([[], []])
    const token = signHostToken("abc")
    const res = await request(app)
      .get("/rooms/abc/users")
      .set("Authorization", `Bearer ${token}`)
    expect(res.status).toBe(404)
  })

  it("200 with user list", async () => {
    mockedExecute
      .mockResolvedValueOnce([[{ id: "abc" }], []]) // room exists
      .mockResolvedValueOnce([
        [{ id: "u1", name: "Alice", room_id: "abc" }],
        [],
      ])
    const token = signHostToken("abc")
    const res = await request(app)
      .get("/rooms/abc/users")
      .set("Authorization", `Bearer ${token}`)
    expect(res.status).toBe(200)
    expect(res.body.data.users).toEqual([
      { id: "u1", name: "Alice", room_id: "abc" },
    ])
  })
})

describe("POST /rooms/:id/users (joinRoom)", () => {
  it("404 when room not found", async () => {
    mockedExecute.mockResolvedValueOnce([[], []])
    const token = signUserToken("u1")
    const res = await request(app)
      .post("/rooms/abc/users")
      .set("Authorization", `Bearer ${token}`)
    expect(res.status).toBe(404)
  })

  it("404 when user not found", async () => {
    mockedExecute
      .mockResolvedValueOnce([[{ id: "abc", name: "Room" }], []]) // room
      .mockResolvedValueOnce([[], []]) // user
    const token = signUserToken("u1")
    const res = await request(app)
      .post("/rooms/abc/users")
      .set("Authorization", `Bearer ${token}`)
    expect(res.status).toBe(404)
  })

  it("200 with updated user", async () => {
    mockedExecute
      .mockResolvedValueOnce([[{ id: "abc", name: "Room" }], []])
      .mockResolvedValueOnce([[{ id: "u1", name: "Alice" }], []])
      .mockResolvedValueOnce([{ affectedRows: 1 }, []])
    const token = signUserToken("u1")
    const res = await request(app)
      .post("/rooms/abc/users")
      .set("Authorization", `Bearer ${token}`)
    expect(res.status).toBe(200)
    expect(res.body.data).toMatchObject({
      id: "u1",
      name: "Alice",
      room_id: "abc",
    })
  })
})

describe("DELETE /rooms/:id/users/:userId (removeUserFromRoom)", () => {
  it("404 when no rows deleted", async () => {
    mockedExecute.mockResolvedValueOnce([{ affectedRows: 0 }, []])
    const token = signHostToken("abc")
    const res = await request(app)
      .delete("/rooms/abc/users/u1")
      .set("Authorization", `Bearer ${token}`)
    expect(res.status).toBe(404)
  })

  it("200 when user removed", async () => {
    mockedExecute.mockResolvedValueOnce([{ affectedRows: 1 }, []])
    const token = signHostToken("abc")
    const res = await request(app)
      .delete("/rooms/abc/users/u1")
      .set("Authorization", `Bearer ${token}`)
    expect(res.status).toBe(200)
  })
})
