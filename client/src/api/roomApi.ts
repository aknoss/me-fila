import {
  useMutation,
  UseMutationOptions,
  useQuery,
  UseQueryOptions,
} from "@tanstack/react-query"
import { API_METHOD, API_ROUTES } from "../constants/apiRoutes"
import { fetchData } from "./fetchData"
import type { Room, ApiApiSuccessResponse, ApiApiErrorResponse } from "@me-fila/shared/types"

const GET_ROOM_QUERY_KEY = "get-room-query-key"

type useGetRoomQueryApiSuccessResponse = ApiSuccessResponse<{ room: Room }>
export function useGetRoomQuery(
  accessToken: string,
  options?: UseQueryOptions<useGetRoomQueryApiSuccessResponse, ApiErrorResponse>
) {
  return useQuery<useGetRoomQueryApiSuccessResponse, ApiErrorResponse>({
    ...options,
    queryKey: [GET_ROOM_QUERY_KEY, accessToken],
    queryFn: () =>
      fetchData({
        url: API_ROUTES.ROOM,
        method: API_METHOD.GET,
        accessToken,
      }),
  })
}

type useCreateRoomMutationApiSuccessResponse = ApiSuccessResponse<{
  room: Room
  accessToken: string
}>
type useCreateRoomMutationVariables = { name: string }
export function useCreateRoomMutation(
  options?: UseMutationOptions<
    useCreateRoomMutationApiSuccessResponse,
    ApiErrorResponse,
    useCreateRoomMutationVariables
  >
) {
  return useMutation<
    useCreateRoomMutationApiSuccessResponse,
    ApiErrorResponse,
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

type useDeleteRoomMutationApiSuccessResponse = ApiSuccessResponse<null>
type useDeleteRoomMutationVariables = { accessToken: string }
export function useDeleteRoomMutation(
  options?: UseMutationOptions<
    useDeleteRoomMutationApiSuccessResponse,
    ApiErrorResponse,
    useDeleteRoomMutationVariables
  >
) {
  return useMutation<
    useDeleteRoomMutationApiSuccessResponse,
    ApiErrorResponse,
    useDeleteRoomMutationVariables
  >({
    ...options,
    mutationFn: ({ accessToken }) =>
      fetchData({
        url: API_ROUTES.ROOM,
        method: API_METHOD.DELETE,
        accessToken,
      }),
  })
}
