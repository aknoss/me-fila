import { PrismaClient, Room, User } from "@prisma/client";
import { NextFunction, Request, Response } from "express";

type CreateRoomRequestBody = { hostId: string };
type CreateRoomResponse = { room: Room } | { error: string };

const prisma = new PrismaClient();

export async function createRoom(
  req: Request<{}, {}, CreateRoomRequestBody>,
  res: Response<CreateRoomResponse>,
  next: NextFunction
) {
  try {
    const hostId = req.body.hostId;
    const host: User | null = await prisma.user.findUnique({
      where: { id: hostId },
    });

    if (!host) {
      res.status(404).json({ error: `User id not found: ${hostId}` });
    }

    const room = await prisma.room.create({
      data: { hostId },
    });

    console.log("Room created: ", room.id);
    res.json({ room });
  } catch (error) {
    next(error);
  }
}

export function getRoom(req: Request, res: Response) {}

export function deleteRoom(req: Request, res: Response) {}
