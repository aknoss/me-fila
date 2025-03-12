import express from "express";
import { createRoom } from "../controllers/hostController";

const hostRoutes = express.Router();

hostRoutes.post("/", createRoom);

export { hostRoutes };
