import { PrismaClient } from "@prisma/client";
import { NextFunction, Request, Response } from "express";

const prisma = new PrismaClient();

export async function createRoom(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const hostId = req.params.hostId;

    const host = await prisma.user.findUnique({
      where: { id: req.params.hostId },
    });

    if (!host) {
      res.status(404).json({ error: `User id not found: ${hostId}` });
    }

    const room = await prisma.room.create({
      data: { hostId },
    });

    console.log("Room created:", room);
  } catch (error) {
    next(error);
  }
}

export function getRoom(req: Request, res: Response) {}

export function deleteRoom(req: Request, res: Response) {}
