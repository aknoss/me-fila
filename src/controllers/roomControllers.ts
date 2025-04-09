import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { PrismaClient, Room } from "@prisma/client";
import { ApiResponse } from "../types";
import { logger } from "../logger";
import { getEnv } from "../env";
import { nanoid } from "nanoid";

const HOST_JWT_SECRET = getEnv("HOST_JWT_SECRET");
const prisma = new PrismaClient();

type CreateRoomRequestBody = { name: string };
type CreateRoomResponse = ApiResponse<{ room: Room; hostToken: string }>;
export async function createRoom(
  req: Request<{}, {}, CreateRoomRequestBody>,
  res: CreateRoomResponse
) {
  try {
    const name = req.body.name;
    if (!name) {
      const error = {
        message: "A name for the room is required",
        code: 400,
      };
      logger.error(error);
      res.status(500).json({ data: null, error });
      return;
    }
    // Easy ID for the user to type when looking for a room
    const nanoId = nanoid(12);
    const room = await prisma.room.create({ data: { id: nanoId, name } });
    const hostToken = jwt.sign(room.id, HOST_JWT_SECRET!);

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

export async function deleteRoom(req: Request, res: ApiResponse) {
  try {
    const roomId = req.roomId;
    await prisma.room.delete({ where: { id: roomId } });
    logger.info("Room deleted successfully");
    res.status(200).json({ data: null, error: null });
  } catch (err) {
    const error = err instanceof Error ? err : new Error("Unknown error");
    logger.error("Could not find room to delete", { error });
    res.status(404).json({
      data: null,
      error: { message: "Could not find room to delete", code: 404 },
    });
  }
}
