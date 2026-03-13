import express from "express"
import { createRoom, deleteRoom, getRoomUsers, joinRoom, removeUserFromRoom } from "../controllers/roomControllers"
import { authenticate, authorize } from "../middleware/auth"
import { Role } from "@me-fila/shared/types"

const roomRoutes = express.Router()

roomRoutes.post("/", createRoom)
roomRoutes.delete("/:id", authenticate, authorize(Role.HOST, "roomId"), deleteRoom)
roomRoutes.get("/:id/users", authenticate, authorize(Role.HOST, "roomId"), getRoomUsers)
roomRoutes.post("/:id/users", authenticate, authorize(Role.USER), joinRoom)
roomRoutes.delete("/:id/users/:userId", authenticate, authorize(Role.HOST, "roomId"), removeUserFromRoom)

export { roomRoutes }
