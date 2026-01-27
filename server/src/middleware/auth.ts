import jwt from "jsonwebtoken"
import { logger } from "../logger"
import { getEnv } from "../env"
import type { Request, NextFunction } from "express"
import type { ApiResponse, Role } from "../types"

const JWT_SECRET = getEnv("JWT_SECRET")

export async function authenticate(
  req: Request,
  res: ApiResponse,
  next: NextFunction
) {
  const authHeader = req.headers["authorization"]
  if (!authHeader || !authHeader.includes("Bearer ")) {
    const error = {
      message: "Unauthorized: Missing access token",
      code: 401,
    }
    logger.error(error)
    res.status(401).json({ data: null, error })
    return
  }

  // Extract the access token from "Bearer token"
  const accessToken = authHeader!.split(" ")[1]

  try {
    const payload = jwt.verify(accessToken, JWT_SECRET!) as {
      id: string
      role: Role
    }
    req.id = payload.id
    req.role = payload.role
    next()
  } catch (err) {
    const error = {
      message: "Unauthorized: Invalid access token",
      code: 500,
    }
    logger.error({ error })
    res.status(500).json({ data: null, error })
  }
}
