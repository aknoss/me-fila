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

let roomQuery: { data: { data: { id: string; name: string } } | undefined } = {
  data: { data: { id: "r", name: "Minha Fila" } },
}

const removeUserMock = vi.fn()
const deleteRoomMutate = vi.fn()
let deleteRoomState: {
  isPending: boolean
  isError: boolean
  onSuccess?: () => void
  onError?: (err: { error: { code: number } }) => void
} = { isPending: false, isError: false }

vi.mock("../../src/api/roomApi", () => ({
  useGetRoomQuery: () => roomQuery,
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
  roomQuery = { data: { data: { id: "r", name: "Minha Fila" } } }
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

  it("renders the queue title and does not expose id or QR", () => {
    shell(hostValue())
    expect(screen.getByRole("heading", { name: "Minha Fila" })).toBeInTheDocument()
    expect(screen.queryByText(/Id da fila:/)).not.toBeInTheDocument()
    expect(screen.queryByTestId("qr")).not.toBeInTheDocument()
  })

  it("share button copies the room url and opens it in a new tab", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.assign(navigator, { clipboard: { writeText } })
    const openSpy = vi.spyOn(window, "open").mockImplementation(() => null)
    shell(hostValue())
    await userEvent.click(screen.getByRole("button", { name: /Compartilhar/ }))
    const expectedUrl = `${window.location.origin}/room/r`
    expect(openSpy).toHaveBeenCalledWith(
      expectedUrl,
      "_blank",
      "noopener,noreferrer"
    )
    expect(writeText).toHaveBeenCalledWith(expectedUrl)
    openSpy.mockRestore()
  })

  it("renders empty list message when no users", () => {
    usersQuery = {
      data: { data: { users: [] } },
      isError: false,
      refetch: vi.fn(),
    }
    shell(hostValue())
    expect(screen.getByText("A fila está vazia")).toBeInTheDocument()
  })

  it("first user is being attended: no remove button, has finish button", async () => {
    usersQuery = {
      data: { data: { users: [{ id: "u1", name: "Alice" }] } },
      isError: false,
      refetch: vi.fn(),
    }
    shell(hostValue())
    expect(screen.getByText("Alice")).toBeInTheDocument()
    expect(screen.queryByLabelText("Remover Alice")).not.toBeInTheDocument()
    await userEvent.click(screen.getByText("Finalizar atendimento"))
    expect(removeUserMock).toHaveBeenCalledWith({
      roomId: "r",
      userId: "u1",
      accessToken: "t",
    })
  })

  it("removing a waiting user asks for confirmation first", async () => {
    usersQuery = {
      data: {
        data: {
          users: [
            { id: "u1", name: "Alice" },
            { id: "u2", name: "Bob" },
          ],
        },
      },
      isError: false,
      refetch: vi.fn(),
    }
    shell(hostValue())
    await userEvent.click(screen.getByLabelText("Remover Bob"))
    // not removed until confirmed
    expect(removeUserMock).not.toHaveBeenCalled()
    expect(screen.getByRole("dialog")).toBeInTheDocument()
    await userEvent.click(screen.getByRole("button", { name: "Remover" }))
    expect(removeUserMock).toHaveBeenCalledWith({
      roomId: "r",
      userId: "u2",
      accessToken: "t",
    })
  })

  it("cancelling the confirmation does not remove the user", async () => {
    usersQuery = {
      data: {
        data: {
          users: [
            { id: "u1", name: "Alice" },
            { id: "u2", name: "Bob" },
          ],
        },
      },
      isError: false,
      refetch: vi.fn(),
    }
    shell(hostValue())
    await userEvent.click(screen.getByLabelText("Remover Bob"))
    await userEvent.click(screen.getByRole("button", { name: "Cancelar" }))
    expect(removeUserMock).not.toHaveBeenCalled()
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
  })

  it("shows queue positions", () => {
    usersQuery = {
      data: {
        data: {
          users: [
            { id: "u1", name: "Alice" },
            { id: "u2", name: "Bob" },
          ],
        },
      },
      isError: false,
      refetch: vi.fn(),
    }
    shell(hostValue())
    expect(screen.getByText(/1\./)).toBeInTheDocument()
    expect(screen.getByText(/2\./)).toBeInTheDocument()
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
