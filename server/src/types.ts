import type { Response } from "express";

export type ApiResponse<T = null> = Response<{
  data: T | null;
  error: { message: string; code: number } | null;
}>;
