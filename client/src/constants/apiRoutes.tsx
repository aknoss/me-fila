import { getEnv } from "../env"

const BACKEND_URL = getEnv("VITE_BACKEND_URL")

export enum API_METHOD {
  GET = "GET",
  POST = "POST",
  PATCH = "PATCH",
  DELETE = "DELETE",
}

export const API_ROUTES = {
  ROOMS: BACKEND_URL + "/rooms",
  USERS: BACKEND_URL + "/users",
}
