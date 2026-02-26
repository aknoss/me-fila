import { RowDataPacket } from "mysql2"
import { Room, User } from "@me-fila/shared/types"

export type RoomRow = RowDataPacket & Room
export type UserRow = RowDataPacket & User
