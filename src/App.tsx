import { useCallback, useEffect, useRef, useState } from 'react'
import type { Query, DocumentData, QuerySnapshot, QueryDocumentSnapshot } from 'firebase/firestore'
import { query, limit, getDocs, startAfter, onSnapshot, getCountFromServer } from 'firebase/firestore'

type data = { totalDocs: number; totalPages: number; currentPage: number; docs: QueryDocumentSnapshot[] }

type hookReturnValue = {
  data: data
  error?: Error
  loading: boolean
  getNext: () => void
  getPrevious: () => void
  hasNext: boolean
  hasPrevious: boolean
}

/** Primitive-friendly key that identifies the logical Firestore query. */
export type QueryKey = readonly unknown[]

type hookProps = {
  query: Query
  /** Stable identity for `query`. Change this when sorts/filters change to reset pagination. */
  queryKey: QueryKey
  pageSize?: number
  pageByPage?: boolean
  liveUpdate?: boolean
}

type NavKind = 'reset' | 'next' | 'previous' | 'idle'

type usePaginateType = (props: hookProps) => hookReturnValue

const addQuery = (q: Query, fun: (val: any) => any, value: any) => (value ? query(q, fun(value)) : q)

const usePagination: usePaginateType = ({ pageSize = 10, query: mainQuery, queryKey, pageByPage = false, liveUpdate = false }) => {
  const [error, setError] = useState<Error>()
  const [loading, setLoading] = useState(true)
  const [docs, setDocs] = useState<QueryDocumentSnapshot[]>([])
  /** Last document of each loaded page. Length === current page number. */
  const [pageCursors, setPageCursors] = useState<QueryDocumentSnapshot[]>([])
  const [activeQuery, setActiveQuery] = useState(() => addQuery(mainQuery, limit, pageSize))
  const [totals, setTotals] = useState<Pick<data, 'totalDocs' | 'totalPages'>>({ totalDocs: 0, totalPages: 0 })

  const mainQueryRef = useRef(mainQuery)
  mainQueryRef.current = mainQuery

  const navKindRef = useRef<NavKind>('reset')
  const pageByPageRef = useRef(pageByPage)
  pageByPageRef.current = pageByPage

  const queryKeySignature = JSON.stringify(queryKey)

  const applySnapshot = useCallback((res: QuerySnapshot<DocumentData>) => {
    const lastDoc = res.docs[res.docs.length - 1]
    const kind = navKindRef.current

    if (kind === 'reset') {
      setDocs(res.docs)
      setPageCursors(lastDoc ? [lastDoc] : [])
    } else if (kind === 'next') {
      if (pageByPageRef.current) {
        setDocs(res.docs)
      } else {
        setDocs((prev) => [...prev, ...res.docs])
      }
      if (lastDoc) {
        setPageCursors((prev) => [...prev, lastDoc])
      }
    } else if (kind === 'previous') {
      setDocs(res.docs)
      if (lastDoc) {
        setPageCursors((prev) => [...prev, lastDoc])
      }
    } else {
      if (pageByPageRef.current) {
        setDocs(res.docs)
        if (lastDoc) {
          setPageCursors((prev) => (prev.length === 0 ? [lastDoc] : [...prev.slice(0, -1), lastDoc]))
        }
      }
    }

    navKindRef.current = 'idle'
    setLoading(false)
  }, [])

  const onErr = useCallback((err: Error) => {
    setError(err)
    setLoading(false)
  }, [])

  const refreshTotals = useCallback(() => {
    return getCountFromServer(mainQueryRef.current).then((res) => {
      setTotals({ totalDocs: res.data().count, totalPages: Math.ceil(res.data().count / pageSize) || 0 })
    })
  }, [pageSize])

  // Reset when the logical query (queryKey) or page size changes — not on Query identity
  useEffect(() => {
    let cancelled = false
    navKindRef.current = 'reset'
    setLoading(true)
    setError(undefined)
    setDocs([])
    setPageCursors([])
    setActiveQuery(addQuery(mainQueryRef.current, limit, pageSize))

    refreshTotals().catch((err: Error) => {
      if (cancelled) return
      onErr(err)
    })

    return () => {
      cancelled = true
    }
  }, [queryKeySignature, pageSize, refreshTotals, onErr])

  useEffect(() => {
    let cancelled = false
    setLoading(true)

    if (liveUpdate) {
      const unsubscribe = onSnapshot(
        activeQuery,
        { includeMetadataChanges: true },
        (res) => {
          if (cancelled) return
          // Skip pure metadata echoes for docs; still apply when docs/pending state matter.
          // Recount only after local writes are acknowledged so getCountFromServer is accurate.
          if (!res.metadata.hasPendingWrites) {
            applySnapshot(res)
            refreshTotals().catch((err: Error) => {
              if (cancelled) return
              onErr(err)
            })
          } else if (res.docChanges().length > 0) {
            // Optimistic UI for local adds/removes; count updates on the follow-up snapshot.
            applySnapshot(res)
          }
        },
        (err) => {
          if (cancelled) return
          onErr(err)
        },
      )
      return () => {
        cancelled = true
        unsubscribe()
      }
    }

    getDocs(activeQuery)
      .then((res) => {
        if (cancelled) return
        applySnapshot(res)
      })
      .catch((err: Error) => {
        if (cancelled) return
        onErr(err)
      })

    return () => {
      cancelled = true
    }
  }, [activeQuery, liveUpdate, applySnapshot, onErr, refreshTotals])

  const currentPage = pageCursors.length
  const hasNext = currentPage > 0 && currentPage < totals.totalPages
  const hasPrevious = pageByPage && currentPage > 1

  const getNext = useCallback(() => {
    if (!hasNext) return
    const cursor = pageCursors[pageCursors.length - 1]
    if (!cursor) return
    navKindRef.current = 'next'
    setLoading(true)
    setActiveQuery(addQuery(addQuery(mainQueryRef.current, startAfter, cursor), limit, pageSize))
  }, [hasNext, pageCursors, pageSize])

  const getPrevious = useCallback(() => {
    if (!hasPrevious) return
    const newCursors = pageCursors.slice(0, -2)
    const cursor = newCursors[newCursors.length - 1]
    navKindRef.current = 'previous'
    setPageCursors(newCursors.length ? newCursors : [])
    setLoading(true)
    if (cursor) {
      setActiveQuery(addQuery(addQuery(mainQueryRef.current, startAfter, cursor), limit, pageSize))
    } else {
      navKindRef.current = 'reset'
      setActiveQuery(addQuery(mainQueryRef.current, limit, pageSize))
    }
  }, [hasPrevious, pageCursors, pageSize])

  return {
    error,
    loading,
    getNext,
    getPrevious,
    hasNext,
    hasPrevious,
    data: {
      docs,
      ...totals,
      currentPage,
    },
  }
}

export default usePagination
