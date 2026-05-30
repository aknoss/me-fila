import { describe, it, expect, vi, beforeEach } from "vitest"
import { renderHook, waitFor } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import * as fetchModule from "../../src/api/fetchData"
import {
  useCreateUserMutation,
  useDeleteUserMutation,
  useGetUserQuery,
} from "../../src/api/userApi"

function wrapper() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  )
}

beforeEach(() => {
  vi.restoreAllMocks()
})

describe("userApi hooks", () => {
  it("useCreateUserMutation hits POST /users", async () => {
    const spy = vi
      .spyOn(fetchModule, "fetchData")
      .mockResolvedValue({ data: { user: { id: "u" }, accessToken: "t" }, error: null })
    const { result } = renderHook(() => useCreateUserMutation(), {
      wrapper: wrapper(),
    })
    result.current.mutate({ name: "Alice" })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(spy).toHaveBeenCalledWith({
      url: "http://test.local/users",
      method: "POST",
      body: { name: "Alice" },
    })
  })

  it("useGetUserQuery hits GET /users/:id", async () => {
    const spy = vi
      .spyOn(fetchModule, "fetchData")
      .mockResolvedValue({ data: { id: "u", name: "A" }, error: null })
    const { result } = renderHook(() => useGetUserQuery("u", "t"), {
      wrapper: wrapper(),
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(spy).toHaveBeenCalledWith({
      url: "http://test.local/users/u",
      method: "GET",
      accessToken: "t",
    })
  })

  it("useDeleteUserMutation hits DELETE /users/:id", async () => {
    const spy = vi
      .spyOn(fetchModule, "fetchData")
      .mockResolvedValue({ data: null, error: null })
    const { result } = renderHook(() => useDeleteUserMutation(), {
      wrapper: wrapper(),
    })
    result.current.mutate({ userId: "u", accessToken: "t" })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(spy).toHaveBeenCalledWith({
      url: "http://test.local/users/u",
      method: "DELETE",
      accessToken: "t",
    })
  })
})
