import { describe, it, expect } from "vitest"
import { render } from "@testing-library/react"
import { ErrorMessage } from "../../src/components/ErrorMessage"

describe("ErrorMessage", () => {
  it("renders red text and merges className", () => {
    const { container } = render(
      <ErrorMessage className="extra">oh no</ErrorMessage>
    )
    const p = container.querySelector("p")!
    expect(p.className).toMatch(/text-red-400/)
    expect(p.className).toMatch(/extra/)
    expect(p.textContent).toBe("oh no")
  })
})
