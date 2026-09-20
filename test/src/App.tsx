import { useMemo, useState } from 'react'
import type { QueryDocumentSnapshot } from 'firebase/firestore'
import { collection, orderBy, query } from 'firebase/firestore'
import usePagination from 'react-firebase-pagination'
import { db, firebaseConfigReady, missingFirebaseEnvKeys } from './firebase'
import { createProduct, deleteProduct, PRODUCTS_COLLECTION } from './products'
import type { Product } from './types'
import { ProductCard } from './components/ProductCard'
import { InsertProductModal } from './components/InsertProductModal'
import { DeleteConfirmModal } from './components/DeleteConfirmModal'

const PAGE_SIZES = [5, 10, 25] as const

const btn =
  'inline-flex items-center justify-center rounded-lg border border-line bg-panel px-3.5 py-2 text-sm font-semibold text-ink transition disabled:cursor-not-allowed disabled:opacity-45'
const btnPrimary = `${btn} border-accent bg-accent text-white`

function App() {
  const [pageByPage, setPageByPage] = useState(true)
  const [liveUpdate, setLiveUpdate] = useState(false)
  const [pageSize, setPageSize] = useState<(typeof PAGE_SIZES)[number]>(10)
  const [listEpoch, setListEpoch] = useState(0)
  const [insertOpen, setInsertOpen] = useState(false)
  const [insertBusy, setInsertBusy] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<QueryDocumentSnapshot | null>(null)
  const [deleteBusy, setDeleteBusy] = useState(false)

  const mainQuery = useMemo(
    () => query(collection(db, PRODUCTS_COLLECTION), orderBy('createdAt', 'desc')),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [listEpoch],
  )

  const refreshList = () => setListEpoch((n) => n + 1)

  const { data, loading, error, getNext, getPrevious, hasNext, hasPrevious } = usePagination({
    query: mainQuery,
    pageSize,
    pageByPage,
    liveUpdate,
  }) as ReturnType<typeof usePagination> & { hasNext: boolean; hasPrevious: boolean }

  return (
    <div className='flex min-h-full flex-col gap-5 px-5 py-6 text-left'>
      <header className='flex flex-wrap items-start justify-between gap-4'>
        <div>
          <p className='mb-1 text-xs font-semibold tracking-wide text-accent uppercase'>react-firebase-pagination</p>
          <h1 className='font-display mb-1 text-3xl font-medium tracking-tight text-ink md:text-4xl'>Product catalog demo</h1>
          <p className='max-w-xl text-muted'>
            Exercises feed vs page pagination against a live Firestore <code>products</code> collection.
          </p>
        </div>
        <button type='button' className={btnPrimary} onClick={() => setInsertOpen(true)}>
          Add product
        </button>
      </header>

      {!firebaseConfigReady ? (
        <p className='rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800'>
          Firebase env is empty ({missingFirebaseEnvKeys.join(', ')}). Copy values from Firebase Console into <code>test/.env</code>, then restart the
          dev server.
        </p>
      ) : null}

      <section
        className='flex flex-wrap items-center gap-x-5 gap-y-3 rounded-xl border border-line bg-panel px-4 py-3'
        aria-label='Pagination controls'
      >
        <label className='inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-ink'>
          <input type='checkbox' checked={pageByPage} onChange={(e) => setPageByPage(e.target.checked)} />
          <span>Page mode</span>
        </label>
        <label className='inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-ink'>
          <input type='checkbox' checked={liveUpdate} onChange={(e) => setLiveUpdate(e.target.checked)} />
          <span>Live update</span>
        </label>
        <label className='inline-flex items-center gap-2 text-sm font-semibold text-ink'>
          <span>Page size</span>
          <select
            className='rounded-lg border border-line bg-canvas px-2 py-1.5 font-medium text-ink'
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value) as (typeof PAGE_SIZES)[number])}
          >
            {PAGE_SIZES.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </label>
        <div className='ml-auto inline-flex items-center gap-2.5 text-sm'>
          <span>
            {data.totalDocs} docs · page {data.currentPage || 0}/{data.totalPages || 0}
          </span>
          {loading ? <span className='rounded-full bg-accent-soft px-2 py-0.5 text-xs font-semibold text-accent'>Loading</span> : null}
        </div>
      </section>

      {error ? <p className='rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800'>{error.message}</p> : null}

      <section className='grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-4' aria-live='polite'>
        {data.docs.map((snap) => (
          <ProductCard key={snap.id} snap={snap} onDelete={setDeleteTarget} />
        ))}
        {!loading && data.docs.length === 0 ? (
          <p className='col-span-full my-8 text-center text-muted'>No products yet. Use “Add product” to create one.</p>
        ) : null}
      </section>

      <footer className='flex justify-center gap-3 pt-2'>
        {pageByPage ? (
          <>
            <button type='button' className={btn} disabled={!hasPrevious || loading} onClick={getPrevious}>
              Previous
            </button>
            <button type='button' className={btn} disabled={!hasNext || loading} onClick={getNext}>
              Next
            </button>
          </>
        ) : (
          <button type='button' className={btn} disabled={!hasNext || loading} onClick={getNext}>
            Load more
          </button>
        )}
      </footer>

      <InsertProductModal
        open={insertOpen}
        busy={insertBusy}
        onClose={() => setInsertOpen(false)}
        onSubmit={async (values) => {
          setInsertBusy(true)
          try {
            await createProduct(values)
            setInsertOpen(false)
            if (!liveUpdate) refreshList()
          } finally {
            setInsertBusy(false)
          }
        }}
      />

      <DeleteConfirmModal
        open={Boolean(deleteTarget)}
        productName={(deleteTarget?.data() as Product | undefined)?.name ?? 'this product'}
        busy={deleteBusy}
        onClose={() => setDeleteTarget(null)}
        onConfirm={async () => {
          if (!deleteTarget) return
          setDeleteBusy(true)
          try {
            await deleteProduct(deleteTarget.id)
            setDeleteTarget(null)
            if (!liveUpdate) refreshList()
          } finally {
            setDeleteBusy(false)
          }
        }}
      />
    </div>
  )
}

export default App
