import { describe, it, expect } from "vitest"
import { screen } from "@testing-library/react"
import { ButtonLink } from "../../src/components/ButtonLink"
import { renderWithRouter } from "../helpers/render"

describe("ButtonLink", () => {
  it("renders a Link with default primary styles", () => {
    renderWithRouter(<ButtonLink to="/x">go</ButtonLink>)
    const link = screen.getByRole("link", { name: "go" })
    expect(link.className).toMatch(/bg-primary/)
    expect(link.getAttribute("href")).toBe("/x")
  })

  it("renders secondary variant", () => {
    renderWithRouter(
      <ButtonLink to="/x" variant="secondary">
        x
      </ButtonLink>
    )
    expect(screen.getByRole("link").className).toMatch(/bg-secondary/)
  })

  it("renders loading spinner instead of link", () => {
    const { container } = renderWithRouter(
      <ButtonLink to="/x" isLoading>
        x
      </ButtonLink>
    )
    expect(container.querySelector("a")).toBeNull()
    expect(container.querySelector("img")).not.toBeNull()
  })
})
