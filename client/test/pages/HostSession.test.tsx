import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter, Routes, Route } from "react-router"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { AuthContext } from "../../src/providers/contexts"
import { makeAuthValue, hostValue } from "../helpers/MockAuthProvider"
import type { AuthContextType } from "../../src/providers/AuthProvider.types"

let usersQuery: {
  data: { data: { users: { id: string; name: string }[] } } | undefined
  isError: boolean
  refetch: () => void
} = { data: undefined, isError: false, refetch: vi.fn() }

const removeUserMock = vi.fn()
const deleteRoomMutate = vi.fn()
let deleteRoomState: {
  isPending: boolean
  isError: boolean
  onSuccess?: () => void
  onError?: (err: { error: { code: number } }) => void
} = { isPending: false, isError: false }

vi.mock("../../src/api/roomApi", () => ({
  useGetRoomUsersQuery: () => usersQuery,
  useRemoveUserFromRoomMutation: () => ({ mutate: removeUserMock }),
  useDeleteRoomMutation: (opts: {
    onSuccess?: () => void
    onError?: (err: { error: { code: number } }) => void
  } = {}) => {
    deleteRoomState.onSuccess = opts.onSuccess
    deleteRoomState.onError = opts.onError
    return {
      mutate: deleteRoomMutate,
      isPending: deleteRoomState.isPending,
      isError: deleteRoomState.isError,
    }
  },
}))

vi.mock("qrcode.react", () => ({
  QRCodeSVG: () => <svg data-testid="qr" />,
}))

import { HostSession } from "../../src/pages/host/HostSession"

const logoutSpy = vi.fn()

function shell(value: Partial<AuthContextType>) {
  const qc = new QueryClient()
  return render(
    <MemoryRouter initialEntries={["/host"]}>
      <QueryClientProvider client={qc}>
        <AuthContext.Provider value={makeAuthValue({ ...value, logout: logoutSpy })}>
          <Routes>
            <Route path="/host" element={<HostSession />} />
            <Route path="/" element={<div>HOME</div>} />
          </Routes>
        </AuthContext.Provider>
      </QueryClientProvider>
    </MemoryRouter>
  )
}

beforeEach(() => {
  usersQuery = { data: undefined, isError: false, refetch: vi.fn() }
  removeUserMock.mockReset()
  deleteRoomMutate.mockReset()
  deleteRoomState = { isPending: false, isError: false }
  logoutSpy.mockReset()
})

describe("HostSession", () => {
  it("redirects to home if not authenticated as host", () => {
    const { container } = shell({})
    expect(container.textContent).toContain("HOME")
  })

  it("renders QR and room id when authenticated", () => {
    shell(hostValue())
    expect(screen.getByText(/Id da fila:/)).toBeInTheDocument()
    expect(screen.getByTestId("qr")).toBeInTheDocument()
  })

  it("renders empty list message when no users", () => {
    usersQuery = {
      data: { data: { users: [] } },
      isError: false,
      refetch: vi.fn(),
    }
    shell(hostValue())
    expect(screen.getByText("A lista está vazia")).toBeInTheDocument()
  })

  it("renders users and removes one", async () => {
    usersQuery = {
      data: { data: { users: [{ id: "u1", name: "Alice" }] } },
      isError: false,
      refetch: vi.fn(),
    }
    shell(hostValue())
    expect(screen.getByText("Alice")).toBeInTheDocument()
    await userEvent.click(screen.getByText("✕"))
    expect(removeUserMock).toHaveBeenCalledWith({
      roomId: "r",
      userId: "u1",
      accessToken: "t",
    })
  })

  it("deletes the queue when trash button clicked", async () => {
    shell(hostValue())
    await userEvent.click(screen.getByLabelText("Deletar fila"))
    expect(deleteRoomMutate).toHaveBeenCalledWith({
      roomId: "r",
      accessToken: "t",
    })
  })

  it("disables trash button + shows spinner when delete pending", () => {
    deleteRoomState.isPending = true
    shell(hostValue())
    const btn = screen.getByLabelText("Deletar fila") as HTMLButtonElement
    expect(btn.disabled).toBe(true)
    expect(btn.querySelector("img")).not.toBeNull()
  })

  it("logs out on successful delete", async () => {
    shell(hostValue())
    await userEvent.click(screen.getByLabelText("Deletar fila"))
    deleteRoomState.onSuccess?.()
    expect(logoutSpy).toHaveBeenCalled()
  })

  it("logs out when delete fails with 404", async () => {
    shell(hostValue())
    await userEvent.click(screen.getByLabelText("Deletar fila"))
    deleteRoomState.onError?.({ error: { code: 404 } })
    expect(logoutSpy).toHaveBeenCalled()
  })

  it("does not log out when delete fails with a non-404", async () => {
    shell(hostValue())
    await userEvent.click(screen.getByLabelText("Deletar fila"))
    deleteRoomState.onError?.({ error: { code: 500 } })
    expect(logoutSpy).not.toHaveBeenCalled()
  })

  it("shows error banner when delete fails", () => {
    deleteRoomState.isError = true
    shell(hostValue())
    expect(screen.getByText(/Algo deu errado/)).toBeInTheDocument()
  })
})
