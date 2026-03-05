import { Role } from "@me-fila/shared/types"

declare global {
  namespace Express {
    interface Request {
      id?: string
      role?: Role
    }
  }
}

export {}
