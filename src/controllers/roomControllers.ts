import { PrismaClient, Room } from "@prisma/client";
import { Request, Response } from "express";
import { ApiResponse } from "../types";
import { logger } from "../logger";

const prisma = new PrismaClient();

type CreateRoomResponse = ApiResponse<Room>;
export async function createRoom(_req: Request, res: CreateRoomResponse) {
  try {
    const room = await prisma.room.create({ data: {} });
    logger.info("Room created successfully", { data: room });
    res.status(201).json({ data: room, error: null });
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
  res: Response
) {
  try {
    const hostId = null;
    if (!hostId) {
    }
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
