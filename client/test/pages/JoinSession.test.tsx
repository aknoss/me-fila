import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter, Routes, Route } from "react-router"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { AuthContext } from "../../src/providers/contexts"
import { makeAuthValue, userValue } from "../helpers/MockAuthProvider"
import type { AuthContextType } from "../../src/providers/AuthProvider.types"

let userQuery: {
  isError: boolean
  data?: { data: { position?: number } }
} = { isError: false }
const deleteUserMutate = vi.fn()
let deleteUserOnSuccess: (() => void) | undefined

vi.mock("../../src/api/userApi", () => ({
  useGetUserQuery: () => userQuery,
  useDeleteUserMutation: (opts: { onSuccess?: () => void } = {}) => {
    deleteUserOnSuccess = opts.onSuccess
    return { mutate: deleteUserMutate }
  },
}))

import { JoinSession } from "../../src/pages/join/JoinSession"

const logoutSpy = vi.fn()

function shell(value: Partial<AuthContextType>) {
  const qc = new QueryClient()
  return render(
    <MemoryRouter initialEntries={["/join"]}>
      <QueryClientProvider client={qc}>
        <AuthContext.Provider value={makeAuthValue({ ...value, logout: logoutSpy })}>
          <Routes>
            <Route path="/join" element={<JoinSession />} />
            <Route path="/" element={<div>HOME</div>} />
          </Routes>
        </AuthContext.Provider>
      </QueryClientProvider>
    </MemoryRouter>
  )
}

beforeEach(() => {
  userQuery = { isError: false }
  deleteUserMutate.mockReset()
  deleteUserOnSuccess = undefined
  logoutSpy.mockReset()
})

describe("JoinSession", () => {
  it("redirects to home when not logged in as USER", () => {
    const { container } = shell({})
    expect(container.textContent).toContain("HOME")
  })

  it("renders session info when logged in", () => {
    shell(userValue())
    expect(screen.getByText(/Username: alice/)).toBeInTheDocument()
  })

  it("does not expose the queue id to the user", () => {
    shell(userValue())
    expect(screen.queryByText(/ID da fila/)).not.toBeInTheDocument()
  })

  it("logs out + deletes user when Sair clicked", async () => {
    shell(userValue())
    await userEvent.click(screen.getByRole("button", { name: "Sair" }))
    expect(deleteUserMutate).toHaveBeenCalledWith({
      userId: "u",
      accessToken: "t",
    })
    deleteUserOnSuccess?.()
    expect(logoutSpy).toHaveBeenCalled()
  })

  it("auto-logs-out when the user is removed (isError true)", () => {
    userQuery = { isError: true }
    shell(userValue())
    expect(logoutSpy).toHaveBeenCalled()
  })

  it("shows how many people are ahead when waiting", () => {
    userQuery = { isError: false, data: { data: { position: 4 } } }
    shell(userValue())
    expect(screen.getByText("3")).toBeInTheDocument()
    expect(screen.getByText("pessoas na sua frente")).toBeInTheDocument()
  })

  it("uses the singular wording when only one person is ahead", () => {
    userQuery = { isError: false, data: { data: { position: 2 } } }
    shell(userValue())
    expect(screen.getByText("1")).toBeInTheDocument()
    expect(screen.getByText("pessoa na sua frente")).toBeInTheDocument()
  })

  it("shows 'it's your turn' when first in line", () => {
    userQuery = { isError: false, data: { data: { position: 1 } } }
    shell(userValue())
    expect(screen.getByText("É a sua vez!")).toBeInTheDocument()
  })
})
