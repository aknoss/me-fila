import express from "express"
import { createUser, getUser, deleteUser } from "../controllers/userControllers"
import { authenticate, authorize } from "../middleware/auth"
import { Role } from "@me-fila/shared/types"
import { asyncHandler } from "../middleware/asyncHandler"

const userRoutes = express.Router()

userRoutes.post("/", asyncHandler(createUser))
userRoutes.get("/:id", authenticate, authorize(Role.USER, "userId"), asyncHandler(getUser))
userRoutes.delete("/:id", authenticate, authorize(Role.USER, "userId"), asyncHandler(deleteUser))

export { userRoutes }
