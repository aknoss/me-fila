import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { PrismaClient, Room } from "@prisma/client";
import { ApiResponse } from "../types";
import { logger } from "../logger";
import { getEnv } from "../env";

const HOST_JWT_SECRET = getEnv("HOST_JWT_SECRET");

const prisma = new PrismaClient();

type CreateRoomRequestBody = { roomName: string };
type CreateRoomResponse = ApiResponse<{ room: Room; hostToken: string }>;
export async function createRoom(
  req: Request<{}, {}, CreateRoomRequestBody>,
  res: CreateRoomResponse
) {
  try {
    const roomName = req.body.roomName;
    if (!roomName) {
      const error = {
        message: "A name for the room is required",
        code: 400,
      };
      logger.error(error);
      res.status(500).json({ data: null, error });
      return;
    }
    const room = await prisma.room.create({ data: { name: roomName } });
    const hostToken = jwt.sign({ roomId: room.id }, HOST_JWT_SECRET!);

    logger.info("Room created successfully", { data: room });
    res.status(201).json({ data: { room, hostToken }, error: null });
  } catch (err) {
    const error = err instanceof Error ? err : new Error("Unknown error");
    logger.error("Failed to create a new room", { error });
    res.status(500).json({
      data: null,
      error: { message: "Failed to create a new room", code: 500 },
    });
  }
}

export async function getRoom(req: Request, res: Response) {}

type DeleteRoomRequestParams = { roomId: string };
type DeleteRoomRequestBody = { hostId: string };
export async function deleteRoom(
  req: Request<DeleteRoomRequestParams, {}, DeleteRoomRequestBody>,
  res: ApiResponse
) {
  try {
    const roomId = req.params.roomId;
    const room = await prisma.room.findUnique({ where: { id: roomId } });

    if (!room) {
      const error = {
        message: `Failed to find room with id: ${roomId}`,
        code: 404,
      };
      logger.error({ error });
      res.status(500).json({ data: null, error });
    }
  } catch (err) {}
}
