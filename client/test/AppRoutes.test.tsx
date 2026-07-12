import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { AuthProvider } from "../src/providers/AuthProvider"

vi.mock("../src/pages/home", () => ({ HomePage: () => <div>HOME</div> }))
vi.mock("../src/pages/host", () => ({ HostPage: () => <div>HOST</div> }))
vi.mock("../src/pages/join", () => ({ JoinPage: () => <div>JOIN</div> }))
vi.mock("../src/pages/room", () => ({ RoomPage: () => <div>ROOM</div> }))

import { AppRoutes } from "../src/AppRoutes"

function shell() {
  const qc = new QueryClient()
  return render(
    <QueryClientProvider client={qc}>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </QueryClientProvider>
  )
}

describe("AppRoutes", () => {
  it("renders the home page at /", () => {
    window.history.pushState({}, "", "/")
    shell()
    expect(screen.getByText("HOME")).toBeInTheDocument()
  })

  it("renders the host page at /host", () => {
    window.history.pushState({}, "", "/host")
    shell()
    expect(screen.getByText("HOST")).toBeInTheDocument()
  })

  it("renders the join page at /join", () => {
    window.history.pushState({}, "", "/join")
    shell()
    expect(screen.getByText("JOIN")).toBeInTheDocument()
  })

  it("renders the room share page at /room/:id", () => {
    window.history.pushState({}, "", "/room/abc")
    shell()
    expect(screen.getByText("ROOM")).toBeInTheDocument()
  })

  it("redirects unknown routes to /", () => {
    window.history.pushState({}, "", "/nothing-here")
    shell()
    expect(screen.getByText("HOME")).toBeInTheDocument()
  })
})
