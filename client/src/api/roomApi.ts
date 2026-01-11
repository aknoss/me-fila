import {
  useMutation,
  UseMutationOptions,
  useQuery,
  UseQueryOptions,
} from "@tanstack/react-query"
import { API_METHOD, API_ROUTES } from "../constants/apiRoutes"
import { fetchData } from "./fetchData"
import type { Room, SuccessResponse, ErrorResponse } from "../types"

const GET_ROOM_QUERY_KEY = "get-room-query-key"

type useGetRoomQuerySuccessResponse = SuccessResponse<{ room: Room }>
export function useGetRoomQuery(
  hostToken: string,
  options?: UseQueryOptions<useGetRoomQuerySuccessResponse, ErrorResponse>
) {
  return useQuery<useGetRoomQuerySuccessResponse, ErrorResponse>({
    ...options,
    queryKey: [GET_ROOM_QUERY_KEY, hostToken],
    queryFn: () =>
      fetchData({
        url: API_ROUTES.ROOM,
        method: API_METHOD.GET,
        hostToken,
      }),
  })
}

type useCreateRoomMutationSuccessResponse = SuccessResponse<{
  room: Room
  hostToken: string
}>
type useCreateRoomMutationVariables = { name: string }
export function useCreateRoomMutation(
  options?: UseMutationOptions<
    useCreateRoomMutationSuccessResponse,
    ErrorResponse,
    useCreateRoomMutationVariables
  >
) {
  return useMutation<
    useCreateRoomMutationSuccessResponse,
    ErrorResponse,
    useCreateRoomMutationVariables
  >({
    ...options,
    mutationFn: ({ name }) =>
      fetchData({
        url: API_ROUTES.ROOM,
        method: API_METHOD.POST,
        body: { name },
      }),
  })
}

type useDeleteRoomMutationSuccessResponse = SuccessResponse<null>
type useDeleteRoomMutationVariables = { hostToken: string }
export function useDeleteRoomMutation(
  options?: UseMutationOptions<
    useDeleteRoomMutationSuccessResponse,
    ErrorResponse,
    useDeleteRoomMutationVariables
  >
) {
  return useMutation<
    useDeleteRoomMutationSuccessResponse,
    ErrorResponse,
    useDeleteRoomMutationVariables
  >({
    ...options,
    mutationFn: ({ hostToken }) =>
      fetchData({
        url: API_ROUTES.ROOM,
        method: API_METHOD.DELETE,
        hostToken,
      }),
  })
}
