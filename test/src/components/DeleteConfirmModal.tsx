type DeleteConfirmModalProps = {
  open: boolean
  productName: string
  busy: boolean
  onClose: () => void
  onConfirm: () => Promise<void>
}

const btn =
  'inline-flex items-center justify-center rounded-lg border border-line bg-panel px-3.5 py-2 text-sm font-semibold text-ink transition disabled:cursor-not-allowed disabled:opacity-45'
const btnGhost = `${btn} bg-transparent`
const btnDanger = `${btn} border-danger bg-danger text-white`

export function DeleteConfirmModal({
  open,
  productName,
  busy,
  onClose,
  onConfirm,
}: DeleteConfirmModalProps) {
  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-40 grid place-items-center bg-[rgb(15_23_22_/0.55)] p-4 backdrop-blur-[2px]"
      role="presentation"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm overflow-auto rounded-xl border border-line bg-panel text-left text-muted shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-product-title"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between gap-4 px-5 pt-4 pb-2">
          <h2 id="delete-product-title" className="font-display m-0 text-xl font-medium text-ink">
            Delete product?
          </h2>
          <button
            type="button"
            className="px-1.5 text-2xl leading-none text-muted"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </header>
        <p className="m-0 px-5 pb-4 leading-snug">
          Remove <strong className="text-ink">{productName}</strong> from Firestore? This cannot be
          undone.
        </p>
        <footer className="flex justify-end gap-2.5 px-5 pb-5">
          <button type="button" className={btnGhost} onClick={onClose} disabled={busy}>
            Cancel
          </button>
          <button
            type="button"
            className={btnDanger}
            disabled={busy}
            onClick={() => void onConfirm()}
          >
            {busy ? 'Deleting…' : 'Delete'}
          </button>
        </footer>
      </div>
    </div>
  )
}
