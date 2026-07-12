// Empty by default so the built client talks to the same origin it is served
// from. In development VITE_BACKEND_URL points at the standalone API server.
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL ?? ""

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
