import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import { MemoryRouter } from "react-router"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { AuthContext } from "../../src/providers/contexts"
import { JoinPage } from "../../src/pages/join"
import { makeAuthValue, userValue } from "../helpers/MockAuthProvider"
import type { AuthContextType } from "../../src/providers/AuthProvider.types"

vi.mock("../../src/api/userApi", () => ({
  useGetUserQuery: () => ({ isError: false }),
  useDeleteUserMutation: () => ({ mutate: () => {} }),
  useCreateUserMutation: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
    isError: false,
  }),
}))

vi.mock("../../src/api/roomApi", () => ({
  useJoinRoomMutation: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
    isError: false,
  }),
}))

function shell(value: Partial<AuthContextType> = {}) {
  const qc = new QueryClient()
  return render(
    <MemoryRouter>
      <QueryClientProvider client={qc}>
        <AuthContext.Provider value={makeAuthValue(value)}>
          <JoinPage />
        </AuthContext.Provider>
      </QueryClientProvider>
    </MemoryRouter>
  )
}

describe("JoinPage", () => {
  it("renders JoinForm when not logged in", () => {
    shell()
    expect(
      screen.getByRole("heading", { name: "Entrar em Fila" })
    ).toBeInTheDocument()
  })

  it("renders JoinSession when logged in as USER", () => {
    shell(userValue())
    expect(screen.getByText(/Username: alice/)).toBeInTheDocument()
  })
})
