import express from "express";
import {
  createUser,
  deleteUser,
  joinRoom,
} from "../controllers/userControllers";
import { authenticateUser } from "../middleware/auth";

const userRoutes = express.Router();

userRoutes.post("/", createUser);
userRoutes.delete("/", authenticateUser, deleteUser);

userRoutes.patch("/:roomId/join", authenticateUser, joinRoom);

export { userRoutes };
