import { describe, it, expect } from "vitest"
import { render } from "@testing-library/react"
import { ButtonGroup } from "../../src/components/ButtonGroup"

describe("ButtonGroup", () => {
  it("renders children inside a flex container", () => {
    const { container } = render(
      <ButtonGroup>
        <span>child</span>
      </ButtonGroup>
    )
    const wrapper = container.firstChild as HTMLElement
    expect(wrapper.className).toMatch(/flex/)
    expect(wrapper.textContent).toBe("child")
  })
})
