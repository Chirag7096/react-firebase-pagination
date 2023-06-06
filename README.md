# react-firebase-pagination

A React Hook that makes it easy to paginate firestore collections.
This hook provides _cumulative_ pagination and does maintain references to previous
documents, so it might not be suitable for large document sets.

## Support for Firebase 9

support for Firebase 9 and are backwards _incompatible_ with previous versions of Firebase.

## Install

```
npm install react-firebase-pagination
```

## Example Use

This is an example of a [Firestore](https://firebase.google.com/docs/firestore/).

You can also change query during runtime. Hook will detect new query and start pagination from the beginning.
Here is an example of controlling query's `orderDirection` by React's state:

```jsx
const mainQuery = query(collection(db, '[collection]'), orderBy('created_timestamp', 'desc'))

const RecentPerfumes = () => {
  const { getNext, getPrevious, data, loading } = usePaginate({
    pageSize: 10,
    pageByPage: true,
    query: mainQuery,
  })

  if (loading) {
    return <Loading />
  }

  ...
}
```

## Caveats

Paginating Firestore documents relies on [query cursors](https://firebase.google.com/docs/firestore/query-data/query-cursors). It's not easy to know
ahead of time how many documents exist in a collection. Consequently, if your `document_count % page_size` is `0` you will notice that your last page
is empty – this is because this hook doesn't (currently) look ahead to know if there are any more documents.
