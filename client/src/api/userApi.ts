import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { API_METHOD, API_ROUTES } from "../constants/apiRoutes";
import { fetchData } from "./fetchData";
import { User, SuccessResponse, ErrorResponse } from "../types";

type useCreateUserMutationSuccessResponse = SuccessResponse<{
  user: User;
  userToken: string;
}>;
type useCreateUserMutationVariables = { name: string };
export function useCreateUserMutation(
  options?: UseMutationOptions<
    useCreateUserMutationSuccessResponse,
    ErrorResponse,
    useCreateUserMutationVariables
  >
) {
  return useMutation<
    useCreateUserMutationSuccessResponse,
    ErrorResponse,
    useCreateUserMutationVariables
  >({
    ...options,
    mutationFn: ({ name }) =>
      fetchData({
        url: API_ROUTES.USER,
        method: API_METHOD.POST,
        body: { name },
      }),
  });
}

type useDeleteUserMutationSuccessResponse = SuccessResponse<null>;
type useDeleteUserMutationVariables = { userToken: string };
export function useDeleteUserMutation(
  options?: UseMutationOptions<
    useDeleteUserMutationSuccessResponse,
    ErrorResponse,
    useDeleteUserMutationVariables
  >
) {
  return useMutation<
    useDeleteUserMutationSuccessResponse,
    ErrorResponse,
    useDeleteUserMutationVariables
  >({
    ...options,
    mutationFn: ({ userToken }) =>
      fetchData({
        url: API_ROUTES.USER,
        method: API_METHOD.DELETE,
        userToken,
      }),
  });
}

type useJoinRoomMutationSuccessResponse = SuccessResponse<User>;
type useJoinRoomMutationVariables = { userToken: string; roomId: string };
export function useJoinRoomMutation(
  options?: UseMutationOptions<
    useJoinRoomMutationSuccessResponse,
    ErrorResponse,
    useJoinRoomMutationVariables
  >
) {
  return useMutation<
    useJoinRoomMutationSuccessResponse,
    ErrorResponse,
    useJoinRoomMutationVariables
  >({
    ...options,
    mutationFn: ({ userToken, roomId }) =>
      fetchData({
        url: API_ROUTES.USER_JOIN,
        method: API_METHOD.PATCH,
        body: { roomId },
        userToken,
      }),
  });
}
