import { useMutation } from "@tanstack/react-query"
import { API_METHOD, API_ROUTES } from "../constants/apiRoutes"
import { fetchData } from "./fetchData"
import {
  ApiErrorResponse,
  ApiSuccessResponse,
  User,
} from "@me-fila/shared/types"
import type { UseMutationOptions } from "@tanstack/react-query"

type useCreateUserMutationSuccessResponse = ApiSuccessResponse<{
  user: User
  accessToken: string
}>
type useCreateUserMutationVariables = { name: string }
export function useCreateUserMutation(
  options?: UseMutationOptions<
    useCreateUserMutationSuccessResponse,
    ApiErrorResponse,
    useCreateUserMutationVariables
  >
) {
  return useMutation<
    useCreateUserMutationSuccessResponse,
    ApiErrorResponse,
    useCreateUserMutationVariables
  >({
    ...options,
    mutationFn: ({ name }) =>
      fetchData({
        url: API_ROUTES.USER,
        method: API_METHOD.POST,
        body: { name },
      }),
  })
}

type useDeleteUserMutationSuccessResponse = ApiSuccessResponse<null>
type useDeleteUserMutationVariables = { accessToken: string }
export function useDeleteUserMutation(
  options?: UseMutationOptions<
    useDeleteUserMutationSuccessResponse,
    ApiErrorResponse,
    useDeleteUserMutationVariables
  >
) {
  return useMutation<
    useDeleteUserMutationSuccessResponse,
    ApiErrorResponse,
    useDeleteUserMutationVariables
  >({
    ...options,
    mutationFn: ({ accessToken }) =>
      fetchData({
        url: API_ROUTES.USER,
        method: API_METHOD.DELETE,
        accessToken,
      }),
  })
}

type useJoinRoomMutationSuccessResponse = ApiSuccessResponse<User>
type useJoinRoomMutationVariables = { accessToken: string; roomId: string }
export function useJoinRoomMutation(
  options?: UseMutationOptions<
    useJoinRoomMutationSuccessResponse,
    ApiErrorResponse,
    useJoinRoomMutationVariables
  >
) {
  return useMutation<
    useJoinRoomMutationSuccessResponse,
    ApiErrorResponse,
    useJoinRoomMutationVariables
  >({
    ...options,
    mutationFn: ({ accessToken, roomId }) =>
      fetchData({
        url: API_ROUTES.USER_JOIN,
        method: API_METHOD.PATCH,
        body: { roomId },
        accessToken,
      }),
  })
}
