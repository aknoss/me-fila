import express from "express";
import {
  createRoom,
  getRoom,
  deleteRoom,
  joinRoom,
} from "../controllers/roomControllers";
import { authenticateHost, authenticateUser } from "../middleware/auth";

const roomRoutes = express.Router();

roomRoutes.post("/", createRoom);

roomRoutes.get("/", getRoom);
roomRoutes.delete("/", authenticateHost, deleteRoom);

roomRoutes.patch("/:roomId/join", authenticateUser, joinRoom);

export { roomRoutes };
