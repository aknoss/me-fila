import express from "express";
import { createUser } from "../controllers/userControllers";

const userRoutes = express.Router();

userRoutes.post("/", createUser);

export { userRoutes };
