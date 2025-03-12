import express from "express";
import { createRoom, deleteRoom } from "../controllers/hostController";

const hostRoutes = express.Router();

hostRoutes.post("/", createRoom);

hostRoutes.delete("/", deleteRoom);

export { hostRoutes };
