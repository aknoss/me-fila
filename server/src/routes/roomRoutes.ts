import express from "express"
import { createRoom, getRoom, deleteRoom } from "../controllers/roomControllers"
import { authenticate } from "../middleware/auth"

const roomRoutes = express.Router()

roomRoutes.post("/", createRoom)
roomRoutes.get("/", authenticate, getRoom)
roomRoutes.delete("/", authenticate, deleteRoom)

export { roomRoutes }
