import { describe, it, expect } from "vitest"
import { render, screen, act } from "@testing-library/react"
import { AuthProvider } from "../../src/providers/AuthProvider"
import { useAuth } from "../../src/providers/useAuth"
import { Role } from "../../src/providers/AuthProvider.types"

function Consumer() {
  const auth = useAuth()
  return (
    <div>
      <span data-testid="token">{auth.accessToken ?? "none"}</span>
      <span data-testid="role">{auth.role ?? "none"}</span>
      <span data-testid="roomId">{auth.roomId ?? "none"}</span>
      <span data-testid="username">{auth.username ?? "none"}</span>
      <span data-testid="userId">{auth.userId ?? "none"}</span>
      <button
        onClick={() =>
          auth.login({
            accessToken: "tok",
            role: Role.HOST,
            roomId: "r1",
          })
        }
      >
        login-host
      </button>
      <button
        onClick={() =>
          auth.login({
            accessToken: "tok2",
            role: Role.USER,
            roomId: "r2",
            username: "alice",
            userId: "u1",
          })
        }
      >
        login-user
      </button>
      <button onClick={auth.logout}>logout</button>
    </div>
  )
}

describe("AuthProvider", () => {
  it("hydrates from localStorage and reflects login/logout state", () => {
    localStorage.setItem("accessToken", "boot")
    localStorage.setItem("roomId", "boot-room")
    localStorage.setItem("username", "boot-user")
    localStorage.setItem("userId", "boot-uid")
    render(
      <AuthProvider>
        <Consumer />
      </AuthProvider>
    )
    expect(screen.getByTestId("token").textContent).toBe("boot")
    expect(screen.getByTestId("roomId").textContent).toBe("boot-room")
    expect(screen.getByTestId("username").textContent).toBe("boot-user")
    expect(screen.getByTestId("userId").textContent).toBe("boot-uid")
  })

  it("login (HOST) without username/userId only updates token/role/roomId", () => {
    render(
      <AuthProvider>
        <Consumer />
      </AuthProvider>
    )
    act(() => {
      screen.getByText("login-host").click()
    })
    expect(screen.getByTestId("token").textContent).toBe("tok")
    expect(screen.getByTestId("role").textContent).toBe(Role.HOST)
    expect(screen.getByTestId("roomId").textContent).toBe("r1")
    expect(screen.getByTestId("username").textContent).toBe("none")
    expect(screen.getByTestId("userId").textContent).toBe("none")
    expect(localStorage.getItem("accessToken")).toBe("tok")
    expect(localStorage.getItem("roomId")).toBe("r1")
  })

  it("login (USER) writes username/userId to state and storage", () => {
    render(
      <AuthProvider>
        <Consumer />
      </AuthProvider>
    )
    act(() => {
      screen.getByText("login-user").click()
    })
    expect(screen.getByTestId("username").textContent).toBe("alice")
    expect(screen.getByTestId("userId").textContent).toBe("u1")
    expect(localStorage.getItem("username")).toBe("alice")
    expect(localStorage.getItem("userId")).toBe("u1")
  })

  it("logout clears everything", () => {
    render(
      <AuthProvider>
        <Consumer />
      </AuthProvider>
    )
    act(() => {
      screen.getByText("login-user").click()
    })
    act(() => {
      screen.getByText("logout").click()
    })
    expect(screen.getByTestId("token").textContent).toBe("none")
    expect(screen.getByTestId("role").textContent).toBe("none")
    expect(screen.getByTestId("roomId").textContent).toBe("none")
    expect(screen.getByTestId("username").textContent).toBe("none")
    expect(screen.getByTestId("userId").textContent).toBe("none")
    expect(localStorage.getItem("accessToken")).toBeNull()
  })

  it("default context (no provider) returns no-op functions", () => {
    render(<Consumer />)
    act(() => {
      screen.getByText("logout").click()
    })
    expect(screen.getByTestId("token").textContent).toBe("none")
    act(() => {
      screen.getByText("login-host").click()
    })
    expect(screen.getByTestId("token").textContent).toBe("none")
    act(() => {
      screen.getByText("login-user").click()
    })
    expect(screen.getByTestId("token").textContent).toBe("none")
  })
})
