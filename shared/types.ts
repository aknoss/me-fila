export type Room = {
  id: string;
  name: string;
};

export type User = {
  id: string;
  name: string;
  room_id?: string;
};

export type ApiSuccessResponse<T> = {
  data: T;
  error: null;
};

export type ApiErrorResponse = {
  data: null;
  error: { message: string; code: number };
};

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

export enum Role {
  HOST = "HOST",
  USER = "USER",
}
