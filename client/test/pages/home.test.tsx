import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { MemoryRouter, Routes, Route } from "react-router"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { HomePage } from "../../src/pages/home"
import { AuthContext } from "../../src/providers/contexts"
import { makeAuthValue, hostValue } from "../helpers/MockAuthProvider"
import type { AuthContextType } from "../../src/providers/AuthProvider.types"

function shell(value: Partial<AuthContextType> = {}, initial: string = "/") {
  const qc = new QueryClient()
  return render(
    <MemoryRouter initialEntries={[initial]}>
      <QueryClientProvider client={qc}>
        <AuthContext.Provider value={makeAuthValue(value)}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/host" element={<div>HOST_PAGE</div>} />
          </Routes>
        </AuthContext.Provider>
      </QueryClientProvider>
    </MemoryRouter>
  )
}

describe("HomePage", () => {
  it("renders title and CTAs when not logged in", () => {
    shell()
    expect(screen.getByRole("heading", { name: "Me Fila" })).toBeInTheDocument()
    expect(
      screen.getByRole("link", { name: "Entrar em Fila" })
    ).toHaveAttribute("href", "/join")
    expect(
      screen.getByRole("link", { name: "Criar Fila" })
    ).toHaveAttribute("href", "/host")
  })

  it("redirects HOST users to /host", () => {
    const { container } = shell(hostValue())
    expect(container.textContent).toContain("HOST_PAGE")
  })
})
