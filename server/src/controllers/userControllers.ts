import jwt from "jsonwebtoken"
import { getEnv } from "../env"
import { logger } from "../logger"
import { prisma } from "../prisma"
import type { Request } from "express"
import type { UserModel } from "../../generated/prisma/models/User"
import type { ApiResponse } from "../types"

const JWT_SECRET = getEnv("JWT_SECRET")

type CreateUserRequestBody = { name: string }
type CreateUserResponse = ApiResponse<{ user: UserModel; accessToken: string }>
export async function createUser(
  req: Request<{}, {}, CreateUserRequestBody>,
  res: CreateUserResponse
) {
  const name = req.body.name

  const user = await prisma.user.create({ data: { name } })
  const accessToken = jwt.sign({ id: user.id, role: "user" }, JWT_SECRET!)

  logger.info("User created successfully", { data: user })
  res.status(201).json({ data: { user, accessToken }, error: null })
}

type GetUserResponse = ApiResponse<{ user: UserModel }>
export async function getUser(req: Request, res: GetUserResponse) {
  if (req.role !== "user") {
    return res.status(403).json({ data: null, error: { message: "Forbidden", code: 403 } })
  }
  const userId = req.id
  const user = await prisma.user.findFirst({
    where: { id: userId },
  })
  if (!user) {
    const error = {
      message: "Could not find user",
      code: 404,
    }
    logger.error(error)
    res.status(404).json({ data: null, error })
    return
  }
  logger.info("User found successfully", { data: user })
  res.status(200).json({ data: { user }, error: null })
}

type DeleteUserParams = { userId: string }
export async function deleteUser(
  req: Request<DeleteUserParams>,
  res: ApiResponse<string>
) {
  if (req.role !== "user") {
    return res.status(403).json({ data: null, error: { message: "Forbidden", code: 403 } })
  }
  const userId = req.id

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { participatedRoomId: true },
  })

  if (!user) {
    logger.error("Could not find user", { userId })
    res.status(404).json({
      data: null,
      error: { message: "Could not find user", code: 404 },
    })
    return
  }

  if (user.participatedRoomId) {
    await prisma.user.update({
      where: { id: userId },
      data: { participatedRoomId: null },
    })
  }

  await prisma.user.delete({
    where: { id: userId },
  })

  logger.error("User deleted successfully", { userId })
  res.status(200).json({ data: "User deleted successfully", error: null })
}

type JoinRoomParams = { roomId: string }
type JoinRoomResponse = ApiResponse<UserModel>
export async function joinRoom(
  req: Request<{}, {}, JoinRoomParams>,
  res: JoinRoomResponse
) {
  if (req.role !== "user") {
    return res.status(403).json({ data: null, error: { message: "Forbidden", code: 403 } })
  }
  const roomId = req.body.roomId
  const userId = req.id

  const roomCount = await prisma.room.count({ where: { id: roomId } })
  const roomExists = roomCount > 0
  if (!roomExists) {
    logger.error("Could not find room to join", { roomId })
    res.status(404).json({
      data: null,
      error: { message: "Could not find room to join", code: 404 },
    })
    return
  }

  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { participatedRoomId: roomId },
    })

    logger.error("User joined room successfully", { updatedUser })
    res.status(200).json({ data: updatedUser, error: null })
  } catch (error) {
    logger.error("Could not find user", { error })
    res.status(500).json({
      data: null,
      error: { message: "Could not find user", code: 404 },
    })
  }
}
