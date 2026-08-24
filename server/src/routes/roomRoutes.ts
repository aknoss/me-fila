import express from "express"
import { createRoom, deleteRoom, getRoom, getRoomUsers, joinRoom, removeUserFromRoom } from "../controllers/roomControllers"
import { authenticate, authorize } from "../middleware/auth"
import { Role } from "@me-fila/shared/types"
import { asyncHandler } from "../middleware/asyncHandler"

const roomRoutes = express.Router()

roomRoutes.post("/", asyncHandler(createRoom))
roomRoutes.get("/:id", asyncHandler(getRoom))
roomRoutes.delete("/:id", authenticate, authorize(Role.HOST, "roomId"), asyncHandler(deleteRoom))
roomRoutes.get("/:id/users", authenticate, authorize(Role.HOST, "roomId"), asyncHandler(getRoomUsers))
roomRoutes.post("/:id/users", authenticate, authorize(Role.USER), asyncHandler(joinRoom))
roomRoutes.delete("/:id/users/:userId", authenticate, authorize(Role.HOST, "roomId"), asyncHandler(removeUserFromRoom))

export { roomRoutes }
