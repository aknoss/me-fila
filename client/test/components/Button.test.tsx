import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { Button } from "../../src/components/Button"

describe("Button", () => {
  it("renders default primary variant and forwards onClick", async () => {
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Click</Button>)
    const btn = screen.getByRole("button", { name: "Click" })
    expect(btn.className).toMatch(/bg-primary/)
    await userEvent.click(btn)
    expect(onClick).toHaveBeenCalled()
  })

  it("renders secondary variant", () => {
    render(<Button variant="secondary">x</Button>)
    expect(screen.getByRole("button").className).toMatch(/bg-secondary/)
  })

  it("renders loading spinner instead of button", () => {
    const { container } = render(<Button isLoading>x</Button>)
    expect(container.querySelector("button")).toBeNull()
    expect(container.querySelector("img")).not.toBeNull()
  })
})
