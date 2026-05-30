import express from "express"
import jwt from "jsonwebtoken"
import { roomRoutes } from "../../src/routes/roomRoutes"
import { userRoutes } from "../../src/routes/userRoutes"
import { errorHandler } from "../../src/middleware/errorHandler"
import { Role } from "@me-fila/shared/types"

export function buildApp() {
  const app = express()
  app.use(express.json())
  app.use("/rooms", roomRoutes)
  app.use("/users", userRoutes)
  app.use(errorHandler)
  return app
}

export function signHostToken(roomId: string) {
  return jwt.sign({ roomId, role: Role.HOST }, process.env.JWT_SECRET!)
}

export function signUserToken(userId: string) {
  return jwt.sign({ userId, role: Role.USER }, process.env.JWT_SECRET!)
}
