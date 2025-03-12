import express from "express";
import { createRoom, getRoom, deleteRoom } from "../controllers/hostController";

const hostRoutes = express.Router();

hostRoutes.post("/", createRoom);
hostRoutes.get("/:id", getRoom);
hostRoutes.delete("/:id", deleteRoom);

export { hostRoutes };
