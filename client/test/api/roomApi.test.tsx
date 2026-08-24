import { describe, it, expect, vi, beforeEach } from "vitest"
import { renderHook, waitFor } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import * as fetchModule from "../../src/api/fetchData"
import {
  useCreateRoomMutation,
  useDeleteRoomMutation,
  useGetRoomQuery,
  useGetRoomUsersQuery,
  useJoinRoomMutation,
  useRemoveUserFromRoomMutation,
} from "../../src/api/roomApi"

function wrapper() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  )
}

beforeEach(() => {
  vi.restoreAllMocks()
})

describe("roomApi hooks", () => {
  it("useCreateRoomMutation calls fetchData with POST /rooms", async () => {
    const spy = vi
      .spyOn(fetchModule, "fetchData")
      .mockResolvedValue({ data: { room: { id: "r" }, accessToken: "t" }, error: null })
    const { result } = renderHook(() => useCreateRoomMutation(), {
      wrapper: wrapper(),
    })
    result.current.mutate({ name: "R" })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(spy).toHaveBeenCalledWith({
      url: "http://test.local/rooms",
      method: "POST",
      body: { name: "R" },
    })
  })

  it("useDeleteRoomMutation hits DELETE /rooms/:id", async () => {
    const spy = vi
      .spyOn(fetchModule, "fetchData")
      .mockResolvedValue({ data: null, error: null })
    const { result } = renderHook(() => useDeleteRoomMutation(), {
      wrapper: wrapper(),
    })
    result.current.mutate({ roomId: "abc", accessToken: "t" })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(spy).toHaveBeenCalledWith({
      url: "http://test.local/rooms/abc",
      method: "DELETE",
      accessToken: "t",
    })
  })

  it("useGetRoomUsersQuery hits GET /rooms/:id/users", async () => {
    const spy = vi
      .spyOn(fetchModule, "fetchData")
      .mockResolvedValue({ data: { users: [] }, error: null })
    const { result } = renderHook(
      () => useGetRoomUsersQuery("abc", "t"),
      { wrapper: wrapper() }
    )
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(spy).toHaveBeenCalledWith({
      url: "http://test.local/rooms/abc/users",
      method: "GET",
      accessToken: "t",
    })
  })

  it("useJoinRoomMutation hits POST /rooms/:id/users", async () => {
    const spy = vi
      .spyOn(fetchModule, "fetchData")
      .mockResolvedValue({ data: { id: "u" }, error: null })
    const { result } = renderHook(() => useJoinRoomMutation(), {
      wrapper: wrapper(),
    })
    result.current.mutate({ roomId: "abc", accessToken: "t" })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(spy).toHaveBeenCalledWith({
      url: "http://test.local/rooms/abc/users",
      method: "POST",
      accessToken: "t",
    })
  })

  it("useRemoveUserFromRoomMutation hits DELETE /rooms/:id/users/:userId", async () => {
    const spy = vi
      .spyOn(fetchModule, "fetchData")
      .mockResolvedValue({ data: null, error: null })
    const { result } = renderHook(
      () => useRemoveUserFromRoomMutation(),
      { wrapper: wrapper() }
    )
    result.current.mutate({ roomId: "abc", userId: "u", accessToken: "t" })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(spy).toHaveBeenCalledWith({
      url: "http://test.local/rooms/abc/users/u",
      method: "DELETE",
      accessToken: "t",
    })
  })

  it("useGetRoomQuery hits GET /rooms/:id", async () => {
    const spy = vi
      .spyOn(fetchModule, "fetchData")
      .mockResolvedValue({ data: { id: "abc", name: "R" }, error: null })
    const { result } = renderHook(() => useGetRoomQuery("abc"), {
      wrapper: wrapper(),
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(spy).toHaveBeenCalledWith({
      url: "http://test.local/rooms/abc",
      method: "GET",
    })
  })
})
