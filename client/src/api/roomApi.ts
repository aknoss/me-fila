import {
  useMutation,
  UseMutationOptions,
  useQuery,
  UseQueryOptions,
} from "@tanstack/react-query"
import { API_METHOD, API_ROUTES } from "../constants/apiRoutes"
import { fetchData } from "./fetchData"
import type { Room, User, ApiSuccessResponse, ApiErrorResponse } from "@me-fila/shared/types"

type useCreateRoomMutationSuccessResponse = ApiSuccessResponse<{
  room: Room
  accessToken: string
}>
type useCreateRoomMutationVariables = { name: string }
export function useCreateRoomMutation(
  options?: UseMutationOptions<
    useCreateRoomMutationSuccessResponse,
    ApiErrorResponse,
    useCreateRoomMutationVariables
  >
) {
  return useMutation<
    useCreateRoomMutationSuccessResponse,
    ApiErrorResponse,
    useCreateRoomMutationVariables
  >({
    ...options,
    mutationFn: ({ name }) =>
      fetchData({
        url: API_ROUTES.ROOMS,
        method: API_METHOD.POST,
        body: { name },
      }),
  })
}

type useDeleteRoomMutationSuccessResponse = ApiSuccessResponse<null>
type useDeleteRoomMutationVariables = { roomId: string; accessToken: string }
export function useDeleteRoomMutation(
  options?: UseMutationOptions<
    useDeleteRoomMutationSuccessResponse,
    ApiErrorResponse,
    useDeleteRoomMutationVariables
  >
) {
  return useMutation<
    useDeleteRoomMutationSuccessResponse,
    ApiErrorResponse,
    useDeleteRoomMutationVariables
  >({
    ...options,
    mutationFn: ({ roomId, accessToken }) =>
      fetchData({
        url: `${API_ROUTES.ROOMS}/${roomId}`,
        method: API_METHOD.DELETE,
        accessToken,
      }),
  })
}

const GET_ROOM_USERS_QUERY_KEY = "get-room-users-query-key"

type useGetRoomUsersQuerySuccessResponse = ApiSuccessResponse<{ users: User[] }>
export function useGetRoomUsersQuery(
  roomId: string,
  accessToken: string,
  options?: UseQueryOptions<useGetRoomUsersQuerySuccessResponse, ApiErrorResponse>
) {
  return useQuery<useGetRoomUsersQuerySuccessResponse, ApiErrorResponse>({
    ...options,
    queryKey: [GET_ROOM_USERS_QUERY_KEY, roomId, accessToken],
    queryFn: () =>
      fetchData({
        url: `${API_ROUTES.ROOMS}/${roomId}/users`,
        method: API_METHOD.GET,
        accessToken,
      }),
  })
}

type useRemoveUserFromRoomMutationSuccessResponse = ApiSuccessResponse<null>
type useRemoveUserFromRoomMutationVariables = { roomId: string; userId: string; accessToken: string }
export function useRemoveUserFromRoomMutation(
  options?: UseMutationOptions<
    useRemoveUserFromRoomMutationSuccessResponse,
    ApiErrorResponse,
    useRemoveUserFromRoomMutationVariables
  >
) {
  return useMutation<
    useRemoveUserFromRoomMutationSuccessResponse,
    ApiErrorResponse,
    useRemoveUserFromRoomMutationVariables
  >({
    ...options,
    mutationFn: ({ roomId, userId, accessToken }) =>
      fetchData({
        url: `${API_ROUTES.ROOMS}/${roomId}/users/${userId}`,
        method: API_METHOD.DELETE,
        accessToken,
      }),
  })
}

type useJoinRoomMutationSuccessResponse = ApiSuccessResponse<User>
type useJoinRoomMutationVariables = { roomId: string; accessToken: string }
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
    mutationFn: ({ roomId, accessToken }) =>
      fetchData({
        url: `${API_ROUTES.ROOMS}/${roomId}/users`,
        method: API_METHOD.POST,
        accessToken,
      }),
  })
}
