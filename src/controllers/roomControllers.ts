import { PrismaClient, Room, User } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import { ApiResponse } from "./types";
import { logger } from "../logger";

type CreateRoomResponse = ApiResponse<Room>;

const prisma = new PrismaClient();

export async function createRoom(
  _req: Request,
  res: Response<CreateRoomResponse>
) {
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

export function getRoom(req: Request, res: Response) {}

export function deleteRoom(req: Request, res: Response) {}
