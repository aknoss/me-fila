import { Response } from "express";

export type ApiResponse<T> = Response<{
  data: T | null;
  error: { message: string; code: number } | null;
}>;
