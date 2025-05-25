import express, { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import { roomRoutes } from "./routes/roomRoutes";
import { ApiResponse } from "./types";
import { logger } from "./logger";
import { userRoutes } from "./routes/userRoutes";

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());
app.use(
  morgan("tiny", {
    stream: { write: (message) => logger.info(message.trim()) },
  })
);

app.use("/room", roomRoutes);
app.use("/user", userRoutes);

app.get("/", (_req, res: ApiResponse<{ message: string }>) => {
  res.json({
    data: { message: "Welcome to the Me Fila API. Check docs for how to use." },
    error: null,
  });
});

app.use(
  (
    error: Error,
    _req: Request,
    res: ApiResponse<null>,
    _next: NextFunction
  ) => {
    logger.error("Something went wrong!", {
      error: {
        message: error.message,
        code: 500,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
    });
    res.status(500).json({
      data: null,
      error: {
        message: "Something went wrong!",
        code: 500,
      },
    });
  }
);

const port = process.env.PORT;
app.listen(port, () => {
  logger.info(`Server is running port ${port}`);
});
