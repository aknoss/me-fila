import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import { MemoryRouter } from "react-router"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { AuthContext } from "../../src/providers/contexts"
import { HostPage } from "../../src/pages/host"
import { makeAuthValue, hostValue } from "../helpers/MockAuthProvider"
import type { AuthContextType } from "../../src/providers/AuthProvider.types"

vi.mock("../../src/api/roomApi", () => ({
  useGetRoomQuery: () => ({ data: { data: { id: "r", name: "Minha Fila" } } }),
  useGetRoomUsersQuery: () => ({ data: undefined, isError: false, refetch: () => {} }),
  useDeleteRoomMutation: () => ({ mutate: () => {}, isPending: false, isError: false }),
  useRemoveUserFromRoomMutation: () => ({ mutate: () => {} }),
  useCreateRoomMutation: () => ({ mutate: () => {}, isPending: false, isError: false }),
}))

function shell(value: Partial<AuthContextType> = {}) {
  const qc = new QueryClient()
  return render(
    <MemoryRouter initialEntries={["/host"]}>
      <QueryClientProvider client={qc}>
        <AuthContext.Provider value={makeAuthValue(value)}>
          <HostPage />
        </AuthContext.Provider>
      </QueryClientProvider>
    </MemoryRouter>
  )
}

describe("HostPage", () => {
  it("renders HostForm when no token", () => {
    shell()
    expect(
      screen.getByRole("heading", { name: "Criar Fila" })
    ).toBeInTheDocument()
  })

  it("renders HostSession when host is authenticated", () => {
    shell(hostValue())
    expect(
      screen.getByRole("button", { name: /Compartilhar/ })
    ).toBeInTheDocument()
  })
})
