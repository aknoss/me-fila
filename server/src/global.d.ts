import { Role } from "@me-fila/shared/types"

declare global {
  namespace Express {
    interface Request {
      roomId?: string
      userId?: string
      role?: Role
    }
  }
}

export {}
