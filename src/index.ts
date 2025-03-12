import express, { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import { roomRoutes } from "./routes/roomRoutes";

dotenv.config();

const app = express();
app.use(morgan("common"));

app.use("/room", roomRoutes);

app.get("/", (_req, res, next) => {
  res.json({
    message: "Welcome to the Me Fila API. Check docs for how to use.",
  });
});

app.use((error: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(error.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

const port = process.env.PORT;
app.listen(port, () => {
  console.log(`[server]: Server is running port ${port}`);
});
