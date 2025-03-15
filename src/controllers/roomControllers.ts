import { PrismaClient, Room, User } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import { ApiResponse } from "./types";
import { logger } from "../logger";

type CreateRoomResponse = ApiResponse<Room>;

const prisma = new PrismaClient();

export async function createRoom(
  req: Request,
  res: Response<CreateRoomResponse>,
  next: NextFunction
) {
  try {
    const hostId = req.body.hostId;
    const host: User | null = await prisma.user.findUnique({
      where: { id: hostId },
    });

    if (!host) {
      logger.error("Cannot create room", {
        error: {
          message: `User id not found: ${hostId}`,
          code: 404,
        },
      });
      res.status(404).json({
        data: null,
        error: { message: `User id not found: ${hostId}`, code: 404 },
      });
    }

    const room = await prisma.room.create({
      data: { hostId },
    });

    logger.info("Room created successfully", { data: room });
    res.status(201).json({ data: room, error: null });
  } catch (error) {
    next(error);
  }
}

export function getRoom(req: Request, res: Response) {}

export function deleteRoom(req: Request, res: Response) {}
