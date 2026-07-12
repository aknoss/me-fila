import { Button } from "./Button"
import { ButtonGroup } from "./ButtonGroup"

type Props = {
  title: string
  message?: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmModal({
  title,
  message,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  onConfirm,
  onCancel,
}: Props) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onCancel}
    >
      <div
        className="flex flex-col gap-5 w-full max-w-sm bg-section p-6 rounded-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold">{title}</h2>
        {message ? <p className="text-secondary/80">{message}</p> : null}
        <ButtonGroup>
          <Button onClick={onConfirm}>{confirmLabel}</Button>
          <Button variant="secondary" onClick={onCancel}>
            {cancelLabel}
          </Button>
        </ButtonGroup>
      </div>
    </div>
  )
}
