import { PrismaClient, Room } from "@prisma/client";
import { Request, Response } from "express";
import { ApiResponse } from "../types";
import { logger } from "../logger";

const prisma = new PrismaClient();

type CreateRoomResponse = ApiResponse<Room>;
export async function createRoom(_req: Request, res: CreateRoomResponse) {
  try {
    const result = await prisma.$transaction(async (tx) => {
      const host = await tx.user.create({ data: {} });
      const room = await tx.room.create({ data: { hostId: host.id } });
      return { room };
    });

    logger.info("Room created successfully", { data: result.room });
    res.status(201).json({ data: result.room, error: null });
  } catch (err) {
    const error = err instanceof Error ? err : new Error("Unknown error");
    logger.error("Failed to create a new room", {
      error: {
        message: error.message,
        code: 500,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
    });
    res.status(500).json({
      data: null,
      error: { message: "Failed to create a new room", code: 500 },
    });
  }
}

export async function getRoom(req: Request, res: Response) {}

type DeleteRoomParams = { roomId: string };
export async function deleteRoom(
  req: Request<DeleteRoomParams>,
  res: Response
) {
  try {
    const roomId = req.params.roomId;
    const room = await prisma.room.findUnique({ where: { id: roomId } });
    if (!room) {
      const error = {
        message: `Failed to find room with specified id: ${roomId}`,
        code: 404,
      };
      logger.error({ error });
      res.status(500).json({ data: null, error });
    }
  } catch (err) {}
}
