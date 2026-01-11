import { PrismaClient } from "../../generated/prisma/client";

const BASE62_CHARSET =
  "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
const BASE62_ID_LENGTH = 5;
const MAX_TRIES = 5;

// Easy ID for the user to type when looking for a room
export function generateBase62() {
  let id = "";
  for (let i = 0; i < BASE62_ID_LENGTH; i++) {
    id += BASE62_CHARSET.charAt(
      Math.floor(Math.random() * BASE62_CHARSET.length),
    );
  }
  return id;
}

export async function generateUniqueBase62(prisma: PrismaClient) {
  for (let i = 0; i < MAX_TRIES; i++) {
    const id = generateBase62();
    const existingRoom = await prisma.room.findUnique({ where: { id } });
    if (!existingRoom) {
      return id;
    }
  }

  throw new Error("Failed to generate a unique id");
}
