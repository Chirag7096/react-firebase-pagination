[![npm version](https://badge.fury.io/js/react-firebase-pagination.svg)](https://badge.fury.io/js/react-firebase-pagination)

# react-firebase-pagination

A React Hook that makes it easy to paginate Firestore collections.
This hook provides _cumulative_ pagination and maintains references to previous documents, so it might not be suitable for large document sets.

## Support for Firebase 9

support for Firebase 9 and are backwards _incompatible_ with previous versions of Firebase.

## Install

```
npm install react-firebase-pagination
```

OR

```
yarn add react-firebase-pagination
```

### Options

| **prop**   | **Type**  | **Default** | **description**                                                                                                                                                                                      | **Required** |
| ---------- | --------- | ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ |
| query      | `Query`   | —           | The Firestore query. Safe to create inline each render; identity is driven by `queryKey`.                                                                                                            | ✔            |
| queryKey   | `unknown[]` | —         | Stable key for the logical query (sorts, filters, collection). Change it when the query meaning changes — pagination resets to page 1.                                                               | ✔            |
| pageSize   | `Number`  | 10          | The number of items per page.                                                                                                                                                                        |              |
| pageByPage | `Boolean` | false       | When this option is True, data is loaded page by page like Google search, and when it's not, it loads data on a single page and appends new data on the bottom of current data like a Facebook feed. |              |
| liveUpdate | `Boolean` | false       | Add Firebase snapshot listener to update data live                                                                                                                                                   |              |

### State

| **prop**    | **value**  | **description**                                                                                             |
| ----------- | ---------- | ----------------------------------------------------------------------------------------------------------- |
| loading     | `Boolean`  | Is true when a page is loading.                                                                             |
| data        | `Object`   | [Data Object](#data-object-contain)                                                                         |
| getNext     | `Function` | W'll render the next page when called. (Take no arguments)                                                  |
| getPrevious | `Function` | W'll render the previous page when called. (Take no arguments and work only in [pageByPage](#options) mode) |
| hasNext     | `Boolean`  | It's true when the next page has data.                                                                      |
| hasPrevious | `Boolean`  | It's true when a previous page has data. (Work only in [pageByPage](#options) mode)                         |

### Data Object Contain

| **prop**    | **value**   | **description**                                                                                    |
| ----------- | ----------- | -------------------------------------------------------------------------------------------------- |
| docs        | `Documents` | Document Array.                                                                                    |
| totalDocs   | `Number`    | Total Document count.                                                                              |
| totalPages  | `Number`    | Total Page count.                                                                                  |
| currentPage | `Number`    | Current Page Number in [pageByPage](#options) mode or how may time's data load on the current page |

## Example Use

This is an example of a [Firestore](https://firebase.google.com/docs/firestore/) query. You can rebuild `query(...)` every render — pass a `queryKey` so the hook only resets when sorts/filters actually change:

```jsx
import usePagination from 'react-firebase-pagination'
import { query, orderBy, collection } from 'firebase/firestore'
import db from './your/database/path'

const App = () => {
  const [sort, setSort] = useState('newest') // 'newest' | 'oldest' | ...

  const mainQuery = query(
    collection(db, '[collection]'),
    sort === 'oldest'
      ? orderBy('created_timestamp', 'asc')
      : orderBy('created_timestamp', 'desc'),
  )

  const { getNext, getPrevious, data, loading } = usePagination({
    pageSize: 10,
    pageByPage: true,
    query: mainQuery,
    queryKey: ['[collection]', sort],
  })

  if (loading) {
    return <LoadingComponent />
  }

  ...
}
```