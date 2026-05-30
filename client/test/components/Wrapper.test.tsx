import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { Wrapper } from "../../src/components/Wrapper"

describe("Wrapper", () => {
  it("renders children", () => {
    render(
      <Wrapper>
        <span>hello</span>
      </Wrapper>
    )
    expect(screen.getByText("hello")).toBeInTheDocument()
  })
})
