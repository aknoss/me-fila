import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { ConfirmModal } from "../../src/components/ConfirmModal"

describe("ConfirmModal", () => {
  it("renders title and message as a dialog", () => {
    render(
      <ConfirmModal
        title="Remover da fila"
        message="Tem certeza?"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />
    )
    const dialog = screen.getByRole("dialog")
    expect(dialog).toBeInTheDocument()
    expect(screen.getByText("Remover da fila")).toBeInTheDocument()
    expect(screen.getByText("Tem certeza?")).toBeInTheDocument()
  })

  it("calls onConfirm when the confirm button is clicked", async () => {
    const onConfirm = vi.fn()
    render(
      <ConfirmModal
        title="t"
        confirmLabel="Remover"
        onConfirm={onConfirm}
        onCancel={vi.fn()}
      />
    )
    await userEvent.click(screen.getByRole("button", { name: "Remover" }))
    expect(onConfirm).toHaveBeenCalled()
  })

  it("calls onCancel when the cancel button is clicked", async () => {
    const onCancel = vi.fn()
    render(<ConfirmModal title="t" onConfirm={vi.fn()} onCancel={onCancel} />)
    await userEvent.click(screen.getByRole("button", { name: "Cancelar" }))
    expect(onCancel).toHaveBeenCalled()
  })

  it("calls onCancel when the backdrop is clicked", async () => {
    const onCancel = vi.fn()
    render(<ConfirmModal title="t" onConfirm={vi.fn()} onCancel={onCancel} />)
    await userEvent.click(screen.getByRole("dialog"))
    expect(onCancel).toHaveBeenCalled()
  })
})
