import express from "express";
import {
  createRoom,
  getRoom,
  deleteRoom,
} from "../controllers/roomControllers";
import { authenticateHost, authenticateUser } from "../middleware/auth";

const roomRoutes = express.Router();

roomRoutes.post("/", createRoom);

roomRoutes.get("/", authenticateHost, getRoom);
roomRoutes.delete("/", authenticateHost, deleteRoom);

export { roomRoutes };
