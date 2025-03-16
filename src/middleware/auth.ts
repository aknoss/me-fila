import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { ApiResponse } from "../types";
import { logger } from "../logger";

const HOST_JWT_SECRET = process.env.HOST_JWT_SECRET;

type AuthenticatedRouteRequestParams = { roomId: string };

if (!HOST_JWT_SECRET) {
  throw new Error(
    "HOST_JWT_SECRET is not defined in the environment variables."
  );
}

// Some routes require the host to be authenticated
export async function authenticateHost(
  req: Request<AuthenticatedRouteRequestParams>,
  res: ApiResponse,
  next: NextFunction
) {
  const authHeader = req.headers["authorization"];
  const roomId = req.params.roomId;

  if (!authHeader || !authHeader.includes("Bearer ")) {
    const error = {
      message: "Unauthorized: Missing token",
      code: 401,
    };
    logger.error(error);
    res.status(401).json({ data: null, error });
  }

  // Extract the token from "Bearer token"
  const hostToken = authHeader!.split(" ")[1];

  try {
    const decoded = jwt.verify(hostToken, HOST_JWT_SECRET!);

    if (decoded === roomId) {
      next();
    } else {
      const error = {
        message: `Unauthorized: Invalid token`,
        code: 401,
      };
      logger.error({ error });
      res.status(401).json({ data: null, error });
    }
  } catch (err) {
    const error = {
      message: "An error occurred while verifying the token",
      code: 500,
    };
    res.status(500).json({ data: null, error });
  }
}
