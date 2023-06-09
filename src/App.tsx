import { useState, useEffect, useMemo } from 'react'
import {
  query,
  startAfter,
  limit,
  Query,
  QueryDocumentSnapshot,
  onSnapshot,
  getCountFromServer,
} from 'firebase/firestore'

type data = {
  docs: QueryDocumentSnapshot[]
  totalDocs: number
  totalPages: number
  currentPage: number
}

type usePaginateType = (props: {
  query: Query
  pageSize: number
  pageByPage: boolean
}) => {
  getNext: () => void
  getPrevious: () => void
  data: data
  loading: boolean
}

const addQuery = (q: Query, fun: (val: any) => any, value: any) => {
  value && (q = query(q, fun(value)))
  return q
}

const usePaginate: usePaginateType = ({
  query: mainQuery,
  pageSize = 10,
  pageByPage = false,
}) => {
  const [loading, setLoading] = useState(false)
  const [docs, setDocs] = useState<QueryDocumentSnapshot[]>([])
  const [lastSnap, setLastSnap] = useState<QueryDocumentSnapshot[]>([])
  const [query, setQuery] = useState(addQuery(mainQuery, limit, pageSize))
  const [totals, setTotals] = useState<{
    totalDocs: number
    totalPages: number
  }>({
    totalDocs: 0,
    totalPages: 0,
  })

  useEffect(() => {
    setLoading(true)
    const unsubscribe = onSnapshot(query, (res) => {
      setDocs((e) => (pageByPage ? res.docs : [...e, ...res.docs]))
      setLastSnap((e) => [...e, res.docs[pageSize - 1]])
      setLoading(false)
    })
    return unsubscribe
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query])

  useEffect(() => {
    setLoading(true)
    getCountFromServer(mainQuery).then((res) => {
      setQuery(addQuery(mainQuery, limit, pageSize))
      setTotals({
        totalDocs: res.data().count,
        totalPages: Math.ceil(res.data().count / pageSize),
      })
    })
  }, [mainQuery, pageSize, pageByPage])

  const getLastEle = (array: any[]) => array[array.length - 1]

  const getNext = () => {
    if (lastSnap.length < totals.totalPages) {
      let q = addQuery(mainQuery, startAfter, getLastEle(lastSnap))
      q = addQuery(q, limit, pageSize)
      setQuery(q)
    }
  }

  const getPrevious = () => {
    if (pageByPage && lastSnap.length > 1) {
      const newArray = lastSnap.slice(0, -2)
      setLastSnap(newArray)
      let q = addQuery(mainQuery, startAfter, getLastEle(newArray))
      q = addQuery(q, limit, pageSize)
      setQuery(q)
    }
  }
  return useMemo(
    () => ({
      getNext,
      getPrevious,
      loading,
      data: {
        docs,
        ...totals,
        currentPage: lastSnap.length,
        hasNext: lastSnap.length < totals.totalPages,
        hasPrevious: 1 < lastSnap.length,
      },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [docs],
  )
}

export default usePaginate
