import { useState, useEffect } from 'react'
import {
  getDocs,
  query,
  startAfter,
  limit,
  Query,
  QueryDocumentSnapshot,
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

const usePaginate: usePaginateType = ({
  query: mainQuery,
  pageSize,
  pageByPage = false,
}) => {
  const [data, setData] = useState<QueryDocumentSnapshot[]>([])
  const [lastSnap, setLastSnap] = useState<QueryDocumentSnapshot[]>([])
  const [totals, setTotals] = useState<{
    totalDocs: number
    totalPages: number
  }>({
    totalDocs: 0,
    totalPages: 0,
  })
  const [loading, setLoading] = useState(false)

  const apiCall = (q: Query) => {
    setLoading(true)
    return new Promise((reslove, reject) => {
      getDocs(q)
        .then((res) => {
          setData((e) => (pageByPage ? res.docs : [...e, ...res.docs]))
          setLastSnap((e) => [...e, res.docs[pageSize - 1]])
          reslove(res)
        })
        .catch((err) => reject(err))
        .finally(() => setLoading(false))
    })
  }

  useEffect(() => {
    getDocs(mainQuery).then((res) => {
      setTotals({
        totalDocs: res.docs.length,
        totalPages: Math.ceil(res.docs.length / pageSize),
      })
    })
    const q = query(mainQuery, limit(pageSize))
    apiCall(q)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const getLastEle = (array: any[]) => array[array.length - 1] || null

  const getNext = () => {
    if (lastSnap.length < totals.totalPages) {
      let q = query(mainQuery, startAfter(getLastEle(lastSnap)))
      q = query(q, limit(pageSize))
      apiCall(q)
    }
  }

  const getPrevious = () => {
    if (pageByPage && lastSnap.length) {
      const newArray = lastSnap.slice(0, -2)
      newArray && setLastSnap(newArray)
      let q = query(mainQuery, startAfter(getLastEle(newArray)))
      q = query(q, limit(pageSize))
      apiCall(q)
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
