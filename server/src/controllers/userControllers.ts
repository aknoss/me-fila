import jwt from "jsonwebtoken"
import { getEnv } from "../env"
import { logger } from "../logger"
import { ApiResponse, Role, User } from "@me-fila/shared/types"
import type { Request, Response } from "express"
import { db } from "../db"
import { ResultSetHeader } from "mysql2"
import { UserRow } from "../dbTypes"

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

  const id = crypto.randomUUID()
  const [result] = await db.execute<ResultSetHeader>(
    "INSERT INTO users (id, name) VALUES (?, ?)",
    [id, name]
  )

  if (result.affectedRows === 0) {
    return res.status(400).json({
      data: null,
      error: { message: "User already exists", code: 400 },
    })
  }

  const user: User = {
    id,
    name: req.body.name,
  }

  const accessToken = jwt.sign({ userId: user.id, role: Role.USER }, JWT_SECRET)

  res.status(201).json({ data: { user, accessToken }, error: null })
}

export async function deleteUser(
  req: Request<{ id: string }>,
  res: Response<ApiResponse<null>>
) {
  const userId = req.params.id

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

  res.status(200).json({ data: null, error: null })
}
