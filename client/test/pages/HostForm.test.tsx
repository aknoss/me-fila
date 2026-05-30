import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter } from "react-router"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { AuthProvider } from "../../src/providers/AuthProvider"

const mutateMock = vi.fn()
let mockState: {
  isPending: boolean
  isError: boolean
  onSuccess?: (data: unknown) => void
} = { isPending: false, isError: false }

vi.mock("../../src/api/roomApi", () => ({
  useCreateRoomMutation: (opts: { onSuccess?: (d: unknown) => void } = {}) => {
    mockState.onSuccess = opts.onSuccess
    return {
      mutate: mutateMock,
      isPending: mockState.isPending,
      isError: mockState.isError,
    }
  },
}))

import { HostForm } from "../../src/pages/host/HostForm"

function shell() {
  const qc = new QueryClient()
  return render(
    <MemoryRouter>
      <QueryClientProvider client={qc}>
        <AuthProvider>
          <HostForm />
        </AuthProvider>
      </QueryClientProvider>
    </MemoryRouter>
  )
}

describe("HostForm", () => {
  beforeEach(() => {
    mutateMock.mockReset()
    mockState = { isPending: false, isError: false }
  })

  it("shows error when submitting empty name", () => {
    shell()
    fireEvent.submit(screen.getByRole("button", { name: "Continuar" }).closest("form")!)
    expect(
      screen.getByText("Insira um nome para a fila por favor")
    ).toBeInTheDocument()
    expect(mutateMock).not.toHaveBeenCalled()
  })

  it("calls mutate when form is valid", async () => {
    shell()
    await userEvent.type(screen.getByLabelText("Nome da Fila"), "My Queue")
    await userEvent.click(screen.getByRole("button", { name: "Continuar" }))
    expect(mutateMock).toHaveBeenCalledWith({ name: "My Queue" })
  })

  it("clears the error on change after a failed submit", async () => {
    shell()
    fireEvent.submit(screen.getByRole("button", { name: "Continuar" }).closest("form")!)
    expect(screen.getByText(/Insira um nome/)).toBeInTheDocument()
    await userEvent.type(screen.getByLabelText("Nome da Fila"), "a")
    expect(screen.queryByText(/Insira um nome/)).toBeNull()
  })

  it("renders error banner when isError", () => {
    mockState.isError = true
    shell()
    expect(screen.getByText(/Algo deu errado/)).toBeInTheDocument()
  })

  it("renders loading button when isPending", () => {
    mockState.isPending = true
    shell()
    expect(
      screen.queryByRole("button", { name: "Continuar" })
    ).toBeNull()
  })

  it("logs the user in on success", async () => {
    shell()
    await waitFor(() => expect(mockState.onSuccess).toBeDefined())
    mockState.onSuccess?.({
      data: { accessToken: "tok", room: { id: "r1" } },
    })
    expect(localStorage.getItem("accessToken")).toBe("tok")
    expect(localStorage.getItem("roomId")).toBe("r1")
  })
})
