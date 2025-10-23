import express from "express";
import {
  createUser,
  getUser,
  deleteUser,
  joinRoom,
} from "../controllers/userControllers";
import { authenticateUser } from "../middleware/auth";

const userRoutes = express.Router();

userRoutes.post("/", createUser);
userRoutes.get("/", authenticateUser, getUser);
userRoutes.delete("/", authenticateUser, deleteUser);

userRoutes.patch("/join", authenticateUser, joinRoom);

export { userRoutes };
