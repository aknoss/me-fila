import jwt from "jsonwebtoken"
import { logger } from "../logger"
import { getEnv } from "../env"
import { generateUniqueBase62 } from "../utils/base62"
import { db } from "../db"
import { ApiResponse, Role, Room } from "@me-fila/shared/types"
import { RoomRow } from "../dbTypes"
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
    res.status(500).json({ data: null, error })
    return
  }

  const id = await generateUniqueBase62()
  await db.execute("INSERT INTO rooms (id, name) VALUES (?, ?)", [id, name])

  const room = { id, name }
  const accessToken = jwt.sign({ id: room.id, role: Role.HOST }, JWT_SECRET!)

  res.status(201).json({ data: { room, accessToken }, error: null })
}

type GetRoomResponse = ApiResponse<{ room: Room }>
export async function getRoom(req: Request, res: Response<GetRoomResponse>) {
  if (req.role !== Role.HOST) {
    return res
      .status(403)
      .json({ data: null, error: { message: "Forbidden", code: 403 } })
  }
  const roomId = req.id
  const [rows] = await db.execute<RoomRow[]>(
    "SELECT * FROM rooms WHERE id = ? LIMIT 1",
    [roomId]
  )
  const room = rows[0]
  if (!room) {
    const error = {
      message: "Could not find room",
      code: 404,
    }
    logger.error(error)
    res.status(404).json({ data: null, error })
    return
  }

  res.status(200).json({ data: { room }, error: null })
}

export async function deleteRoom(
  req: Request,
  res: Response<ApiResponse<null>>
) {
  if (req.role !== Role.HOST) {
    return res
      .status(403)
      .json({ data: null, error: { message: "Forbidden", code: 403 } })
  }
  const roomId = req.id

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
