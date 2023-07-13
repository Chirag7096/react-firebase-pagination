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
| query      | `Query`   | null        | The query of your Firebase database. e.g. `query(collection(db, '[collection]'))`.                                                                                                                   | ✔            |
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

This is an example of a [Firestore](https://firebase.google.com/docs/firestore/).

You can also change query during runtime. Hook will detect new query and start pagination from the beginning.
Here is an example of controlling query's `orderDirection` by React's state:

```jsx
import usePagination from 'react-firebase-pagination';
import { query, orderBy, collection } from 'firebase/firestore'
import db from './your/database/path';

const mainQuery = query(collection(db, '[collection]'), orderBy('created_timestamp', 'desc'));

const App = () => {
  const { getNext, getPrevious, data, loading } = usePagination({
    pageSize: 10,
    pageByPage: true,
    query: mainQuery,
  })

  if (loading) {
    return <LoadingComponent />
  }

  ...
}
```
