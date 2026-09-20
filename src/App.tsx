import { useCallback, useEffect, useRef, useState } from 'react'
import type { Query, DocumentData, QuerySnapshot, QueryDocumentSnapshot } from 'firebase/firestore'
import { query, limit, getDocs, startAfter, onSnapshot, getCountFromServer } from 'firebase/firestore'

type data = {
  totalDocs: number
  totalPages: number
  currentPage: number
  docs: QueryDocumentSnapshot[]
}

type hookReturnValue = {
  data: data
  error?: Error
  loading: boolean
  getNext: () => void
  getPrevious: () => void
  hasNext: boolean
  hasPrevious: boolean
}

type hookProps = {
  query: Query
  pageSize: number
  pageByPage?: boolean
  liveUpdate?: boolean
}

type NavKind = 'reset' | 'next' | 'previous' | 'idle'

type usePaginateType = (props: hookProps) => hookReturnValue

const addQuery = (q: Query, fun: (val: any) => any, value: any) =>
  value ? query(q, fun(value)) : q

const usePagination: usePaginateType = ({
  pageSize = 10,
  query: mainQuery,
  pageByPage = false,
  liveUpdate = false,
}) => {
  const [error, setError] = useState<Error>()
  const [loading, setLoading] = useState(true)
  const [docs, setDocs] = useState<QueryDocumentSnapshot[]>([])
  /** Last document of each loaded page. Length === current page number. */
  const [pageCursors, setPageCursors] = useState<QueryDocumentSnapshot[]>([])
  const [activeQuery, setActiveQuery] = useState(() => addQuery(mainQuery, limit, pageSize))
  const [totals, setTotals] = useState<Pick<data, 'totalDocs' | 'totalPages'>>({
    totalDocs: 0,
    totalPages: 0,
  })

  const navKindRef = useRef<NavKind>('reset')
  const pageByPageRef = useRef(pageByPage)
  pageByPageRef.current = pageByPage

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
      // Cursors were trimmed to everything before the page we left; append this page's cursor.
      if (lastDoc) {
        setPageCursors((prev) => [...prev, lastDoc])
      }
    } else {
      // idle: live snapshot refresh — never advance the page number
      if (pageByPageRef.current) {
        setDocs(res.docs)
        if (lastDoc) {
          setPageCursors((prev) =>
            prev.length === 0 ? [lastDoc] : [...prev.slice(0, -1), lastDoc],
          )
        }
      }
      // Feed mode: ignore idle snapshots so accumulated pages are not wiped
    }

    navKindRef.current = 'idle'
    setLoading(false)
  }, [])

  const onErr = useCallback((err: Error) => {
    setError(err)
    setLoading(false)
  }, [])

  // Reset pagination whenever the base query or page size changes
  useEffect(() => {
    let cancelled = false
    navKindRef.current = 'reset'
    setLoading(true)
    setError(undefined)
    setDocs([])
    setPageCursors([])
    setActiveQuery(addQuery(mainQuery, limit, pageSize))

    getCountFromServer(mainQuery)
      .then((res) => {
        if (cancelled) return
        setTotals({
          totalDocs: res.data().count,
          totalPages: Math.ceil(res.data().count / pageSize) || 0,
        })
      })
      .catch((err: Error) => {
        if (cancelled) return
        onErr(err)
      })

    return () => {
      cancelled = true
    }
  }, [mainQuery, pageSize, onErr])

  // Fetch / listen for the active page query only
  useEffect(() => {
    let cancelled = false
    setLoading(true)

    if (liveUpdate) {
      const unsubscribe = onSnapshot(
        activeQuery,
        (res) => {
          if (cancelled) return
          applySnapshot(res)
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
  }, [activeQuery, liveUpdate, applySnapshot, onErr])

  const currentPage = pageCursors.length
  const hasNext = currentPage > 0 && currentPage < totals.totalPages
  const hasPrevious = pageByPage && currentPage > 1

  const getNext = useCallback(() => {
    if (!hasNext) return
    const cursor = pageCursors[pageCursors.length - 1]
    if (!cursor) return
    navKindRef.current = 'next'
    setLoading(true)
    setActiveQuery(addQuery(addQuery(mainQuery, startAfter, cursor), limit, pageSize))
  }, [hasNext, pageCursors, mainQuery, pageSize])

  const getPrevious = useCallback(() => {
    if (!hasPrevious) return
    const newCursors = pageCursors.slice(0, -2)
    const cursor = newCursors[newCursors.length - 1]
    navKindRef.current = 'previous'
    setPageCursors(newCursors.length ? newCursors : [])
    setLoading(true)
    if (cursor) {
      setActiveQuery(addQuery(addQuery(mainQuery, startAfter, cursor), limit, pageSize))
    } else {
      // Back to first page
      navKindRef.current = 'reset'
      setActiveQuery(addQuery(mainQuery, limit, pageSize))
    }
  }, [hasPrevious, pageCursors, mainQuery, pageSize])

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
