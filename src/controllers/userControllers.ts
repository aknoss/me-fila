import jwt from "jsonwebtoken";
import { Request } from "express";
import { PrismaClient, User } from "@prisma/client";
import { ApiResponse } from "../types";
import { getEnv } from "../env";
import { logger } from "../logger";

const USER_JWT_SECRET = getEnv("USER_JWT_SECRET");
const prisma = new PrismaClient();

type CreateUserRequestBody = { name: string };
type CreateUserResponse = ApiResponse<{ user: User; userToken: string }>;
export async function createUser(
  req: Request<{}, {}, CreateUserRequestBody>,
  res: CreateUserResponse
) {
  const name = req.body.name;

  try {
    const user = await prisma.user.create({ data: { name } });
    const userToken = jwt.sign(user.id, USER_JWT_SECRET!);

    logger.info("User created successfully", { data: user });
    res.status(201).json({ data: { user, userToken }, error: null });
  } catch (err) {
    const error = err instanceof Error ? err : new Error("Unknown error");
    logger.error("Failed to create a new user", { error });
    res.status(500).json({
      data: null,
      error: { message: "Failed to create a new user", code: 500 },
    });
  }
}
