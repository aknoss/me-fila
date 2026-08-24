import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"
import { MemoryRouter, Routes, Route } from "react-router"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

let roomQuery: {
  data: { data: { id: string; name: string } } | undefined
  isLoading: boolean
  isError: boolean
} = { data: undefined, isLoading: false, isError: false }

vi.mock("../../src/api/roomApi", () => ({
  useGetRoomQuery: () => roomQuery,
}))

vi.mock("qrcode.react", () => ({
  QRCodeSVG: ({ value }: { value: string }) => (
    <svg data-testid="qr" data-value={value} />
  ),
}))

import { RoomPage } from "../../src/pages/room"

function shell() {
  const qc = new QueryClient()
  return render(
    <MemoryRouter initialEntries={["/room/abc"]}>
      <QueryClientProvider client={qc}>
        <Routes>
          <Route path="/room/:id" element={<RoomPage />} />
        </Routes>
      </QueryClientProvider>
    </MemoryRouter>
  )
}

beforeEach(() => {
  roomQuery = { data: undefined, isLoading: false, isError: false }
})

describe("RoomPage", () => {
  it("shows the queue name, id and a QR code pointing at the join url", () => {
    roomQuery = {
      data: { data: { id: "abc", name: "Minha Fila" } },
      isLoading: false,
      isError: false,
    }
    shell()
    expect(
      screen.getByRole("heading", { name: "Minha Fila" })
    ).toBeInTheDocument()
    expect(screen.getByText(/Id da fila: abc/)).toBeInTheDocument()
    expect(screen.getByTestId("qr").getAttribute("data-value")).toContain(
      "/join?id=abc"
    )
  })

  it("shows an error when the room is not found", () => {
    roomQuery = { data: undefined, isLoading: false, isError: true }
    shell()
    expect(screen.getByText("Fila não encontrada")).toBeInTheDocument()
  })

  it("shows spinner when loading", () => {
    roomQuery = { data: undefined, isLoading: true, isError: false }
    const { container } = shell()
    expect(container.querySelector("img")).toBeInTheDocument()
  })

  it("shows error when data is missing without isError", () => {
    roomQuery = { data: undefined, isLoading: false, isError: false }
    shell()
    expect(screen.getByText("Fila não encontrada")).toBeInTheDocument()
  })
})
