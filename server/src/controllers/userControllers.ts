import jwt from "jsonwebtoken";
import { Request } from "express";
import { User } from "@prisma/client";
import { ApiResponse } from "../types";
import { getEnv } from "../env";
import { logger } from "../logger";
import { prisma } from "../prisma";

const USER_JWT_SECRET = getEnv("USER_JWT_SECRET");

type CreateUserRequestBody = { name: string };
type CreateUserResponse = ApiResponse<{ user: User; userToken: string }>;
export async function createUser(
  req: Request<{}, {}, CreateUserRequestBody>,
  res: CreateUserResponse,
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

export async function deleteUser(
  req: Request<JoinRoomParams>,
  res: ApiResponse<string>,
) {
  const userId = req.userId;
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { participatedRoomId: true },
    });

    if (!user) {
      logger.error("Could not find user", { userId });
      res.status(404).json({
        data: null,
        error: { message: "Could not find user", code: 404 },
      });
      return;
    }

    if (user.participatedRoomId) {
      await prisma.user.update({
        where: { id: userId },
        data: { participatedRoomId: null },
      });
    }

    await prisma.user.delete({
      where: { id: userId },
    });

    logger.error("User deleted successfully", { userId });
    res.status(200).json({ data: "User deleted successfully", error: null });
  } catch (err) {
    const error = err instanceof Error ? err : new Error("Unknown error");
    logger.error("Could not delete user", { error });
    res.status(500).json({
      data: null,
      error: { message: "Could not delete user", code: 404 },
    });
  }
}

type JoinRoomParams = { roomId: string };
type JoinRoomResponse = ApiResponse<User>;
export async function joinRoom(
  req: Request<{}, {}, JoinRoomParams>,
  res: JoinRoomResponse,
) {
  const roomId = req.body.roomId;
  const userId = req.userId;
  try {
    const roomExists = (await prisma.room.count({ where: { id: roomId } })) > 0;

    if (!roomExists) {
      logger.error("Could not find room to join", { roomId });
      res.status(404).json({
        data: null,
        error: { message: "Could not find room to join", code: 404 },
      });
      return;
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { participatedRoomId: roomId },
    });

    logger.error("User joined room successfully", { updatedUser });
    res.status(200).json({ data: updatedUser, error: null });
  } catch (err) {
    const error = err instanceof Error ? err : new Error("Unknown error");
    logger.error("Could not insert user into the room", { error });
    res.status(500).json({
      data: null,
      error: { message: "Could not insert user into the room", code: 404 },
    });
  }
}
