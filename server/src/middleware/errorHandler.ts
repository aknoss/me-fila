import { logger } from "../logger"
import type { NextFunction, Request } from "express"
import type { ApiResponse } from "../types"

export const errorHandler = (
  error: Error,
  _req: Request,
  res: ApiResponse<null>,
  _next: NextFunction
) => {
  logger.error("Something went wrong!", {
    error: {
      message: error.message,
      code: 500,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    },
  })
  res.status(500).json({
    data: null,
    error: {
      message: "Something went wrong!",
      code: 500,
    },
  })
}
