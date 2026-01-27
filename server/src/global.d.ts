import { Role } from "./types"

declare global {
  namespace Express {
    interface Request {
      id?: string
      role?: Role
    }
  }
}

export {}
