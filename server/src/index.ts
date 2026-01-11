import dotenv from "dotenv";
import express, { Request, Response } from "express";
import cors from "cors";
import morgan from "morgan";
import { roomRoutes } from "./routes/roomRoutes";
import { ApiResponse } from "./types";
import { logger } from "./logger";
import { userRoutes } from "./routes/userRoutes";
import { errorHandler } from "./middleware/errorHandler";

dotenv.config();

const PORT = 5000;
const app = express();
app.use(express.json());
app.use(cors());
app.use(
  morgan("tiny", {
    stream: { write: (message) => logger.info(message.trim()) },
  }),
);

app.use("/room", roomRoutes);
app.use("/user", userRoutes);

app.get("/", (_req, res: ApiResponse<{ message: string }>) => {
  res.json({
    data: { message: "Welcome to the Me Fila API. Check docs for how to use." },
    error: null,
  });
});

app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`Server is running port ${PORT}`);
});
