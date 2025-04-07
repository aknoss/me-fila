import { Request, Response } from "express";
import { User } from "@prisma/client";
import { ApiResponse } from "../types";
import { getEnv } from "../env";

const USER_JWT_SECRET = getEnv("USER_JWT_SECRET");

type CreateUserRequestBody = { name: string };
type CreateUserResponse = ApiResponse<{ user: User; userToken: string }>;
export async function createUser(
  req: Request<{}, {}, CreateUserRequestBody>,
  res: CreateUserResponse
) {}
