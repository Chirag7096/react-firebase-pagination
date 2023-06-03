import { useState, useEffect, useCallback } from 'react'
import {
  getDocs,
  query,
  startAfter,
  limit,
  Query,
  QueryDocumentSnapshot,
} from 'firebase/firestore'

type usePaginateType = (props: {
  query: Query
  pageSize: number
  pageByPage: boolean
}) => {
  // getNext: Function;
  // getPrevious: Function;
  // data: DocumentChangeType;
  // totalDocs: number;
  // loading: boolean;
}

const usePaginate: usePaginateType = ({
  query: mainQuery,
  pageSize,
  pageByPage = false,
}) => {
  const [data, setData] = useState<QueryDocumentSnapshot[]>([])
  const [pages, setPages] = useState<QueryDocumentSnapshot[]>([])
  const [totalDocs, setTotalDocs] = useState(0)
  const [loading, setLoading] = useState(false)

  const apiCall = useCallback(
    (q: Query) => {
      setLoading(true)
      return new Promise((reslove, reject) => {
        getDocs(q)
          .then((res) => {
            setData((e) => (pageByPage ? res.docs : [...e, ...res.docs]))
            setPages((e) => [...e, res.docs[pageSize - 1]])
            reslove(res)
          })
          .catch((err) => reject(err))
          .finally(() => setLoading(false))
      })
    },
    [pageByPage, pageSize],
  )

  useEffect(() => {
    getDocs(mainQuery).then((res) => {
      setTotalDocs(res.docs.length)
    })
    apiCall(mainQuery)
  }, [mainQuery, apiCall])

  const getLastEle = (array: any[]) => array[array.length - 1]

  const getNext = () => {
    let q = query(mainQuery, limit(pageSize))
    q = query(q, startAfter(getLastEle(pages)))
    apiCall(q)
  }

  const getPrevious = () => {
    if (pageByPage) {
      const newArray = pages.slice(0, -2)
      newArray && setPages(newArray)
      let q = query(mainQuery, limit(pageSize))
      q = query(q, startAfter(getLastEle(newArray)))
      apiCall(q)
    }
  }

  return { getNext, getPrevious, data, totalDocs, loading }
}

export default usePaginate
