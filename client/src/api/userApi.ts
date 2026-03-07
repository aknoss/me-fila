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
        url: API_ROUTES.USERS,
        method: API_METHOD.POST,
        body: { name },
      }),
  })
}

type useDeleteUserMutationSuccessResponse = ApiSuccessResponse<null>
type useDeleteUserMutationVariables = { userId: string; accessToken: string }
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
    mutationFn: ({ userId, accessToken }) =>
      fetchData({
        url: `${API_ROUTES.USERS}/${userId}`,
        method: API_METHOD.DELETE,
        accessToken,
      }),
  })
}
