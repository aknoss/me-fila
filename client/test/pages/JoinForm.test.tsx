import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter } from "react-router"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { AuthProvider } from "../../src/providers/AuthProvider"

const createUserMutateAsync = vi.fn()
let createUserState = { isPending: false, isError: false }
const joinRoomMutateAsync = vi.fn()
let joinRoomState: {
  isPending: boolean
  isError: boolean
  onSuccess?: (d: unknown) => void
} = { isPending: false, isError: false }

vi.mock("../../src/api/userApi", () => ({
  useCreateUserMutation: () => ({
    mutateAsync: createUserMutateAsync,
    isPending: createUserState.isPending,
    isError: createUserState.isError,
  }),
}))

vi.mock("../../src/api/roomApi", () => ({
  useJoinRoomMutation: (opts: { onSuccess?: (d: unknown) => void } = {}) => {
    joinRoomState.onSuccess = opts.onSuccess
    return {
      mutateAsync: joinRoomMutateAsync,
      isPending: joinRoomState.isPending,
      isError: joinRoomState.isError,
    }
  },
}))

import { JoinForm } from "../../src/pages/join/JoinForm"

function shell(route: string = "/join") {
  const qc = new QueryClient()
  return render(
    <MemoryRouter initialEntries={[route]}>
      <QueryClientProvider client={qc}>
        <AuthProvider>
          <JoinForm />
        </AuthProvider>
      </QueryClientProvider>
    </MemoryRouter>
  )
}

beforeEach(() => {
  createUserMutateAsync.mockReset()
  joinRoomMutateAsync.mockReset()
  createUserState = { isPending: false, isError: false }
  joinRoomState = { isPending: false, isError: false }
})

describe("JoinForm", () => {
  it("prefills room id from ?id query param", () => {
    shell("/join?id=ABC12")
    expect((screen.getByLabelText("ID da Fila") as HTMLInputElement).value).toBe(
      "ABC12"
    )
  })

  it("shows error when room id is empty on submit", () => {
    shell()
    fireEvent.submit(screen.getByRole("button", { name: "Continuar" }).closest("form")!)
    expect(screen.getByText("Insira um id por favor")).toBeInTheDocument()
    expect(createUserMutateAsync).not.toHaveBeenCalled()
  })

  it("clears error when typing in id field", async () => {
    shell()
    fireEvent.submit(screen.getByRole("button", { name: "Continuar" }).closest("form")!)
    await userEvent.type(screen.getByLabelText("ID da Fila"), "x")
    expect(screen.queryByText("Insira um id por favor")).toBeNull()
  })

  it("submits create user + join room and logs in on success", async () => {
    createUserMutateAsync.mockResolvedValueOnce({
      data: { accessToken: "tok", user: { id: "u1" } },
    })
    joinRoomMutateAsync.mockResolvedValueOnce({})

    shell()
    await userEvent.type(screen.getByLabelText("ID da Fila"), "ROOM1")
    await userEvent.type(screen.getByLabelText("Seu Nome"), "Alice")
    await userEvent.click(screen.getByRole("button", { name: "Continuar" }))

    await waitFor(() =>
      expect(createUserMutateAsync).toHaveBeenCalledWith({ name: "Alice" })
    )
    await waitFor(() =>
      expect(joinRoomMutateAsync).toHaveBeenCalledWith({
        accessToken: "tok",
        roomId: "ROOM1",
      })
    )
    // Trigger join onSuccess
    joinRoomState.onSuccess?.({
      data: { id: "u1", name: "Alice", room_id: "ROOM1" },
    })
    expect(localStorage.getItem("accessToken")).toBe("tok")
    expect(localStorage.getItem("username")).toBe("Alice")
    expect(localStorage.getItem("userId")).toBe("u1")
  })

  it("shows error banner when create user errors", () => {
    createUserState.isError = true
    shell()
    expect(screen.getByText(/Algo deu errado/)).toBeInTheDocument()
  })

  it("shows error banner when join room errors", () => {
    joinRoomState.isError = true
    shell()
    expect(screen.getByText(/Algo deu errado/)).toBeInTheDocument()
  })

  it("shows loading button while pending", () => {
    createUserState.isPending = true
    shell()
    expect(screen.queryByRole("button", { name: "Continuar" })).toBeNull()
  })
})
