import { getEnv } from "../env"

const BACKEND_URL = getEnv("VITE_BACKEND_URL")

export enum API_METHOD {
  GET = "GET",
  POST = "POST",
  PATCH = "PATCH",
  DELETE = "DELETE",
}

export const API_ROUTES = {
  ROOM: BACKEND_URL + "/room",
  USER: BACKEND_URL + "/user",
  USER_JOIN: BACKEND_URL + "/user/join",
}
