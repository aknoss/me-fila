import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { Input } from "../../src/components/Input"

describe("Input", () => {
  it("renders label and forwards onChange", async () => {
    const onChange = vi.fn()
    render(<Input id="a" label="Name" onChange={onChange} />)
    expect(screen.getByLabelText("Name")).toBeInTheDocument()
    await userEvent.type(screen.getByLabelText("Name"), "x")
    expect(onChange).toHaveBeenCalled()
  })

  it("shows error message only when isError and errorMessage are set", () => {
    const { rerender } = render(
      <Input id="a" label="Name" isError={false} errorMessage="bad" />
    )
    expect(screen.queryByText("bad")).toBeNull()

    rerender(<Input id="a" label="Name" isError errorMessage="bad" />)
    expect(screen.getByText("bad")).toBeInTheDocument()

    rerender(<Input id="a" label="Name" isError />)
    expect(screen.queryByText("bad")).toBeNull()
  })
})
