import { useState, useEffect } from 'react'
import {
  getDocs,
  query,
  startAfter,
  limit,
  Query,
  QueryDocumentSnapshot,
  onSnapshot,
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
  pageSize,
  pageByPage = false,
}) => {
  const [data, setData] = useState<QueryDocumentSnapshot[]>([])
  const [lastSnap, setLastSnap] = useState<QueryDocumentSnapshot[]>([])
  const [query, setQuery] = useState(addQuery(mainQuery, limit, pageSize))
  const [totals, setTotals] = useState<{
    totalDocs: number
    totalPages: number
  }>({
    totalDocs: 0,
    totalPages: 0,
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    const unsubscribe = onSnapshot(query, (res) => {
      setData((e) => (pageByPage ? res.docs : [...e, ...res.docs]))
      setLastSnap((e) => [...e, res.docs[pageSize - 1]])
      setLoading(false)
    })
    return unsubscribe
  }, [query, pageByPage, pageSize])

  useEffect(() => {
    setLoading(true)
    getDocs(mainQuery).then((res) => {
      setQuery(addQuery(mainQuery, limit, pageSize))
      setTotals({
        totalDocs: res.docs.length,
        totalPages: Math.ceil(res.docs.length / pageSize),
      })
    })
  }, [mainQuery, pageSize])

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

  return {
    getNext,
    getPrevious,
    loading,
    data: {
      docs: data,
      ...totals,
      currentPage: lastSnap.length,
    },
  }
}

export default usePaginate
