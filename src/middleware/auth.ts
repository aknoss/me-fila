import { Request, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { ApiResponse } from "../types";
import { logger } from "../logger";
import { getEnv } from "../env";

const HOST_JWT_SECRET = getEnv("HOST_JWT_SECRET");

export async function authenticateHost(
  req: Request,
  res: ApiResponse,
  next: NextFunction
) {
  const authHeader = req.headers["authorization"];
  if (!authHeader || !authHeader.includes("Bearer ")) {
    const error = {
      message: "Unauthorized: Missing token",
      code: 401,
    };
    logger.error(error);
    res.status(401).json({ data: null, error });
    return;
  }

  // Extract the token from "Bearer token"
  const hostToken = authHeader!.split(" ")[1];

  try {
    const roomId = jwt.verify(hostToken, HOST_JWT_SECRET!) as string;
    req.roomId = roomId;
    next();
  } catch (err) {
    const error = {
      message: "Unauthorized: Invalid token",
      code: 500,
    };
    logger.error({ error });
    res.status(500).json({ data: null, error });
  }
}
