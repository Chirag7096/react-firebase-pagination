import type { Product, ProductCategory } from '../types'
import { PRODUCT_CATEGORIES } from '../types'

type InsertProductModalProps = {
  open: boolean
  busy: boolean
  onClose: () => void
  onSubmit: (values: Omit<Product, 'createdAt'>) => Promise<void>
}

const emptyForm = {
  name: '',
  price: '',
  sku: '',
  category: 'electronics' as ProductCategory,
  imageUrl: '',
  desc: '',
  rating: '4.5',
  reviewCount: '0',
}

const field =
  'grid gap-1.5 text-sm font-semibold text-ink [&_input]:rounded-lg [&_input]:border [&_input]:border-line [&_input]:bg-canvas [&_input]:px-2.5 [&_input]:py-2 [&_input]:font-normal [&_input]:text-ink [&_select]:rounded-lg [&_select]:border [&_select]:border-line [&_select]:bg-canvas [&_select]:px-2.5 [&_select]:py-2 [&_select]:font-normal [&_select]:text-ink [&_textarea]:rounded-lg [&_textarea]:border [&_textarea]:border-line [&_textarea]:bg-canvas [&_textarea]:px-2.5 [&_textarea]:py-2 [&_textarea]:font-normal [&_textarea]:text-ink'
const btnPrimary =
  'inline-flex items-center justify-center gap-1.5 rounded-lg border border-accent bg-accent px-3.5 py-2 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-45'
const btnGhost =
  'inline-flex items-center justify-center gap-1.5 rounded-lg border border-line bg-transparent px-3.5 py-2 text-sm font-semibold text-ink transition disabled:cursor-not-allowed disabled:opacity-45'

export function InsertProductModal({
  open,
  busy,
  onClose,
  onSubmit,
}: InsertProductModalProps) {
  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-40 grid place-items-center bg-[rgb(15_23_22_/0.55)] p-4 backdrop-blur-[2px]"
      role="presentation"
      onClick={onClose}
    >
      <div
        className="max-h-[min(90svh,720px)] w-full max-w-lg overflow-auto rounded-xl border border-line bg-panel text-left text-muted shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="insert-product-title"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between gap-4 px-5 pt-4 pb-2">
          <h2 id="insert-product-title" className="font-display m-0 text-xl font-medium text-ink">
            Add product
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

        <form
          className="grid gap-3.5 px-5 pb-5"
          onSubmit={async (e) => {
            e.preventDefault()
            const fd = new FormData(e.currentTarget)
            const values: Omit<Product, 'createdAt'> = {
              name: String(fd.get('name') ?? '').trim(),
              price: Number(fd.get('price')),
              sku: String(fd.get('sku') ?? '').trim(),
              category: String(fd.get('category')) as ProductCategory,
              imageUrl: String(fd.get('imageUrl') ?? '').trim(),
              desc: String(fd.get('desc') ?? '').trim(),
              rating: Number(fd.get('rating')),
              reviewCount: Number(fd.get('reviewCount')),
            }
            await onSubmit(values)
          }}
        >
          <label className={field}>
            Name
            <input name="name" required defaultValue={emptyForm.name} />
          </label>
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            <label className={field}>
              Price
              <input
                name="price"
                type="number"
                min="0"
                step="0.01"
                required
                defaultValue={emptyForm.price}
              />
            </label>
            <label className={field}>
              SKU
              <input name="sku" required defaultValue={emptyForm.sku} />
            </label>
          </div>
          <label className={field}>
            Category
            <select name="category" defaultValue={emptyForm.category}>
              {PRODUCT_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
          <label className={field}>
            Image URL
            <input
              name="imageUrl"
              type="url"
              required
              placeholder="https://…"
              defaultValue={emptyForm.imageUrl}
            />
          </label>
          <label className={field}>
            Description
            <textarea name="desc" rows={3} required defaultValue={emptyForm.desc} />
          </label>
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            <label className={field}>
              Rating (1–5)
              <input
                name="rating"
                type="number"
                min="1"
                max="5"
                step="0.1"
                required
                defaultValue={emptyForm.rating}
              />
            </label>
            <label className={field}>
              Review count
              <input
                name="reviewCount"
                type="number"
                min="0"
                step="1"
                required
                defaultValue={emptyForm.reviewCount}
              />
            </label>
          </div>

          <footer className="flex justify-end gap-2.5 pt-1">
            <button type="button" className={btnGhost} onClick={onClose} disabled={busy}>
              Cancel
            </button>
            <button type="submit" className={btnPrimary} disabled={busy}>
              {busy ? (
                'Saving…'
              ) : (
                <>
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 16 16"
                    className="size-4 shrink-0 fill-none stroke-current stroke-2"
                  >
                    <path d="M8 3v10M3 8h10" strokeLinecap="round" />
                  </svg>
                  Add product
                </>
              )}
            </button>
          </footer>
        </form>
      </div>
    </div>
  )
}
