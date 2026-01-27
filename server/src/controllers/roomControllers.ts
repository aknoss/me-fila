import jwt from "jsonwebtoken"
import { logger } from "../logger"
import { getEnv } from "../env"
import { prisma } from "../prisma"
import { generateUniqueBase62 } from "../utils/base62"
import type { Request } from "express"
import type { RoomModel } from "../../generated/prisma/models/Room"
import { Role, type ApiResponse } from "../types"

const JWT_SECRET = getEnv("JWT_SECRET")

type CreateRoomRequestBody = { name: string }
type CreateRoomResponse = ApiResponse<{ room: RoomModel; accessToken: string }>
export async function createRoom(
  req: Request<{}, {}, CreateRoomRequestBody>,
  res: CreateRoomResponse
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

  const id = await generateUniqueBase62(prisma)
  const room = await prisma.room.create({ data: { id, name } })
  const accessToken = jwt.sign({ id: room.id, role: "host" }, JWT_SECRET!)

  logger.info("Room created successfully", { data: room })
  res.status(201).json({ data: { room, accessToken }, error: null })
}

type GetRoomResponse = ApiResponse<{ room: RoomModel }>
export async function getRoom(req: Request, res: GetRoomResponse) {
  if (req.role !== Role.HOST) {
    return res
      .status(403)
      .json({ data: null, error: { message: "Forbidden", code: 403 } })
  }
  const roomId = req.id
  const room = await prisma.room.findFirst({
    where: { id: roomId },
    include: { participants: true },
  })
  if (!room) {
    const error = {
      message: "Could not find room",
      code: 404,
    }
    logger.error(error)
    res.status(404).json({ data: null, error })
    return
  }
  logger.info("Room found successfully", { data: room })
  res.status(200).json({ data: { room }, error: null })
}

export async function deleteRoom(req: Request, res: ApiResponse) {
  if (req.role !== "host") {
    return res
      .status(403)
      .json({ data: null, error: { message: "Forbidden", code: 403 } })
  }
  const roomId = req.id
  try {
    await prisma.room.delete({ where: { id: roomId } })
    logger.info("Room deleted successfully")
    res.status(200).json({ data: null, error: null })
  } catch (error) {
    logger.error("Could not find room to delete", { error })
    res.status(404).json({
      data: null,
      error: { message: "Could not find room to delete", code: 404 },
    })
  }
}
