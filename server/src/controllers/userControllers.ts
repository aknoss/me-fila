import jwt from "jsonwebtoken"
import { getEnv } from "../env"
import { logger } from "../logger"
import { ApiResponse, Role, User } from "@me-fila/shared/types"
import type { Request, Response } from "express"
import { db } from "../db"
import { ResultSetHeader } from "mysql2"
import { RoomRow, UserRow } from "../dbTypes"

const JWT_SECRET = getEnv("JWT_SECRET")

type CreateUserRequestBody = { name: string }
type CreateUserResponse = Response<
  ApiResponse<{ user: User; accessToken: string }>
>
export async function createUser(
  req: Request<{}, {}, CreateUserRequestBody>,
  res: CreateUserResponse
) {
  const name = req.body.name

  const [result] = await db.execute<ResultSetHeader>(
    "INSERT INTO users (name) VALUES (?)",
    [name]
  )

  if (result.affectedRows === 0) {
    logger.warn("User already exists", { name: req.body.name })
    return res.status(400).json({
      data: null,
      error: { message: "User already exists", code: 404 },
    })
  }

  const user: User = {
    id: result.insertId.toString(),
    name: req.body.name,
  }

  const accessToken = jwt.sign({ id: user.id, role: Role.USER }, JWT_SECRET!)

  logger.info("User created successfully", { data: user })
  res.status(201).json({ data: { user, accessToken }, error: null })
}

type GetUserResponse = Response<ApiResponse<{ user: User }>>
export async function getUser(req: Request, res: GetUserResponse) {
  if (req.role !== Role.USER) {
    return res
      .status(403)
      .json({ data: null, error: { message: "Forbidden", code: 403 } })
  }
  const userId = req.id
  const [userRows] = await db.execute<UserRow[]>(
    "SELECT * FROM users WHERE id = ? LIMIT 1",
    [userId]
  )
  const user = userRows[0]
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
  res: Response<ApiResponse<string>>
) {
  if (req.role !== Role.USER) {
    return res
      .status(403)
      .json({ data: null, error: { message: "Forbidden", code: 403 } })
  }
  const userId = req.id

  const [userRows] = await db.execute<UserRow[]>(
    "SELECT * FROM users WHERE id = ? LIMIT 1",
    [userId]
  )
  const user = userRows[0]

  if (!user) {
    logger.error("Could not find user", { userId })
    res.status(404).json({
      data: null,
      error: { message: "Could not find user", code: 404 },
    })
    return
  }

  await db.execute<ResultSetHeader>("DELETE FROM users WHERE id = ?", [userId])

  logger.error("User deleted successfully", { userId })
  res.status(200).json({ data: "User deleted successfully", error: null })
}

type JoinRoomParams = { roomId: string }
type JoinRoomResponse = Response<ApiResponse<User>>
export async function joinRoom(
  req: Request<{}, {}, JoinRoomParams>,
  res: JoinRoomResponse
) {
  if (req.role !== Role.USER) {
    return res
      .status(403)
      .json({ data: null, error: { message: "Forbidden", code: 403 } })
  }
  const roomId = req.body.roomId
  const userId = req.id

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
