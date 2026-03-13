import express from "express"
import { createUser, getUser, deleteUser } from "../controllers/userControllers"
import { authenticate, authorize } from "../middleware/auth"
import { Role } from "@me-fila/shared/types"

const userRoutes = express.Router()

userRoutes.post("/", createUser)
userRoutes.get("/:id", authenticate, authorize(Role.USER, "userId"), getUser)
userRoutes.delete("/:id", authenticate, authorize(Role.USER, "userId"), deleteUser)

export { userRoutes }
