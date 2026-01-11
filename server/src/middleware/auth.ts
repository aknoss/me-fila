import jwt from "jsonwebtoken";
import { logger } from "../logger";
import { getEnv } from "../env";
import type { Request, NextFunction } from "express";
import type { ApiResponse } from "../types";

const HOST_JWT_SECRET = getEnv("HOST_JWT_SECRET");
const USER_JWT_SECRET = getEnv("USER_JWT_SECRET");

export async function authenticateHost(
  req: Request,
  res: ApiResponse,
  next: NextFunction,
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

export async function authenticateUser(
  req: Request,
  res: ApiResponse,
  next: NextFunction,
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
  const userToken = authHeader!.split(" ")[1];

  try {
    const userId = jwt.verify(userToken, USER_JWT_SECRET!) as string;
    req.userId = userId;
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
