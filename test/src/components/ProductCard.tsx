import type { QueryDocumentSnapshot } from 'firebase/firestore'
import type { Product } from '../types'

type ProductCardProps = {
  snap: QueryDocumentSnapshot
  onDelete: (snap: QueryDocumentSnapshot) => void
}

export function ProductCard({ snap, onDelete }: ProductCardProps) {
  const product = snap.data() as Product

  return (
    <article className="flex min-w-0 flex-col overflow-hidden rounded-xl border border-line bg-panel text-left">
      <div className="aspect-[4/3] bg-line/40">
        <img
          src={product.imageUrl}
          alt=""
          loading="lazy"
          className="block h-full w-full object-cover"
        />
      </div>
      <div className="grid gap-1.5 px-4 pt-3.5 pb-4">
        <p className="w-fit rounded-full border border-accent/30 bg-accent-soft px-2 py-0.5 text-[0.72rem] font-semibold text-accent capitalize">
          {product.category}
        </p>
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display m-0 text-[1.05rem] leading-snug font-medium text-ink">
            {product.name}
          </h3>
          <p className="m-0 shrink-0 font-bold whitespace-nowrap text-accent">
            ${Number(product.price).toFixed(2)}
          </p>
        </div>
        <p className="m-0 font-mono text-xs text-muted">{product.sku}</p>
        <p className="m-0 line-clamp-2 text-sm leading-snug">{product.desc}</p>
        <div className="mt-1.5 flex items-center justify-between gap-3">
          <span>
            ★ {Number(product.rating).toFixed(1)}
            <span className="font-normal text-muted"> ({product.reviewCount})</span>
          </span>
          <button
            type="button"
            className="rounded-md px-1.5 py-1 text-sm font-semibold text-danger hover:bg-red-50"
            onClick={() => onDelete(snap)}
          >
            Delete
          </button>
        </div>
      </div>
    </article>
  )
}
