import jwt from "jsonwebtoken"
import { logger } from "../logger"
import { getEnv } from "../env"
import { Role } from "@me-fila/shared/types"
import type { Request, Response, NextFunction } from "express"

const JWT_SECRET = getEnv("JWT_SECRET")

type HostPayload = { roomId: string; role: Role.HOST }
type UserPayload = { userId: string; role: Role.USER }
type JwtPayload = HostPayload | UserPayload

export function authenticate(req: Request, res: Response, next: NextFunction) {
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

  const accessToken = authHeader.split(" ")[1]

  try {
    const payload = jwt.verify(accessToken, JWT_SECRET) as JwtPayload
    req.role = payload.role
    if (payload.role === Role.HOST) {
      req.roomId = payload.roomId
    } else {
      req.userId = payload.userId
    }
    next()
  } catch (err) {
    const error = {
      message: "Unauthorized: Invalid access token",
      code: 401,
    }
    logger.error({ error })
    res.status(401).json({ data: null, error })
  }
}

export function authorize(role: Role, ownershipParam?: "roomId" | "userId") {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.role !== role) {
      return res
        .status(403)
        .json({ data: null, error: { message: "Forbidden", code: 403 } })
    }

    if (ownershipParam) {
      const tokenValue =
        ownershipParam === "roomId" ? req.roomId : req.userId
      if (tokenValue !== req.params.id) {
        return res.status(403).json({
          data: null,
          error: { message: "Forbidden: you do not own this resource", code: 403 },
        })
      }
    }

    next()
  }
}
