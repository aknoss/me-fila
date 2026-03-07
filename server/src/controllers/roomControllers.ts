import jwt from "jsonwebtoken"
import { logger } from "../logger"
import { getEnv } from "../env"
import { generateUniqueBase62 } from "../utils/base62"
import { db } from "../db"
import { ApiResponse, Role, Room, User } from "@me-fila/shared/types"
import { RoomRow, UserRow } from "../dbTypes"
import { ResultSetHeader } from "mysql2"
import type { Request, Response } from "express"

const JWT_SECRET = getEnv("JWT_SECRET")

type CreateRoomRequestBody = { name: string }
type CreateRoomResponse = ApiResponse<{ room: Room; accessToken: string }>
export async function createRoom(
  req: Request<{}, {}, CreateRoomRequestBody>,
  res: Response<CreateRoomResponse>
) {
  const name = req.body.name
  if (!name) {
    const error = {
      message: "A name for the room is required",
      code: 400,
    }
    logger.error(error)
    res.status(400).json({ data: null, error })
    return
  }

  const id = await generateUniqueBase62()
  await db.execute("INSERT INTO rooms (id, name) VALUES (?, ?)", [id, name])

  const room = { id, name }
  const accessToken = jwt.sign({ roomId: room.id, role: Role.HOST }, JWT_SECRET)

  res.status(201).json({ data: { room, accessToken }, error: null })
}

export async function deleteRoom(
  req: Request<{ id: string }>,
  res: Response<ApiResponse<null>>
) {
  const roomId = req.params.id

  const [result] = await db.execute<ResultSetHeader>(
    "DELETE FROM rooms WHERE id = ?",
    [roomId]
  )

  if (result.affectedRows === 0) {
    logger.warn("No room found to delete", { roomId })
    return res.status(404).json({
      data: null,
      error: { message: "Could not find room to delete", code: 404 },
    })
  }

  logger.info("Room deleted successfully")
  res.status(200).json({ data: null, error: null })
}

type GetRoomUsersResponse = ApiResponse<{ users: User[] }>
export async function getRoomUsers(
  req: Request<{ id: string }>,
  res: Response<GetRoomUsersResponse>
) {
  const roomId = req.params.id

  const [roomRows] = await db.execute<RoomRow[]>(
    "SELECT id FROM rooms WHERE id = ?",
    [roomId]
  )
  if (roomRows.length === 0) {
    return res.status(404).json({
      data: null,
      error: { message: "Could not find room", code: 404 },
    })
  }

  const [userRows] = await db.execute<UserRow[]>(
    "SELECT id, name, room_id FROM users WHERE room_id = ?",
    [roomId]
  )

  res
    .status(200)
    .json({ data: { users: userRows.map(({ id, name, room_id }) => ({ id, name, room_id })) }, error: null })
}

type JoinRoomResponse = ApiResponse<User>
export async function joinRoom(
  req: Request<{ id: string }>,
  res: Response<JoinRoomResponse>
) {
  const roomId = req.params.id
  const userId = req.userId

  const [roomRows] = await db.execute<RoomRow[]>(
    "SELECT * FROM rooms WHERE id = ? LIMIT 1",
    [roomId]
  )
  if (!roomRows[0]) {
    logger.error("Could not find room to join", { roomId })
    res.status(404).json({
      data: null,
      error: { message: "Could not find room to join", code: 404 },
    })
    return
  }

  const [userRows] = await db.execute<UserRow[]>(
    "SELECT * FROM users WHERE id = ? LIMIT 1",
    [userId]
  )
  if (!userRows[0]) {
    logger.error("Could not find user", { userId })
    res.status(404).json({
      data: null,
      error: { message: "Could not find user", code: 404 },
    })
    return
  }

  await db.execute<ResultSetHeader>(
    "UPDATE users SET room_id = ? WHERE id = ?",
    [roomId, userId]
  )

  const updatedUser: User = { ...userRows[0], room_id: roomId }
  logger.info("User joined room successfully", { updatedUser })
  res.status(200).json({ data: updatedUser, error: null })
}
