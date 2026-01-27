import express from "express"
import {
  createUser,
  getUser,
  deleteUser,
  joinRoom,
} from "../controllers/userControllers"
import { authenticate } from "../middleware/auth"

const userRoutes = express.Router()

userRoutes.post("/", createUser)
userRoutes.get("/", authenticate, getUser)
userRoutes.delete("/", authenticate, deleteUser)

userRoutes.patch("/join", authenticate, joinRoom)

export { userRoutes }
