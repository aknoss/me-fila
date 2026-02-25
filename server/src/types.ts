import type { Response } from "express"

type Room = {
  id: string
  name: string
}

type User = {
  id: string
  name: string
  room_id?: string
}

export type ApiResponse<T = null> = Response<{
  data: T | null
  error: { message: string; code: number } | null
}>

export enum Role {
  HOST = "HOST",
  USER = "USER",
}
