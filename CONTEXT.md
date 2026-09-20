# react-firebase-pagination

A React hook that paginates Firestore queries, plus a Vite demo that exercises it against a Product catalog.

## Language

**Product**:
A sellable item stored as a Firestore document in the `products` collection, with `name`, `price`, `sku`, `category`, `createdAt`, `imageUrl`, `desc`, `rating`, and `reviewCount`.
_Avoid_: Post, item, record, document (when meaning the domain entity)

**Product category**:
One of `electronics`, `clothing`, `home`, or `other`.
_Avoid_: Tag, type, department

**Feed pagination**:
Pagination mode that appends each next page of Products onto the current list (infinite scroll / “load more” style).
_Avoid_: Infinite scroll (implementation), cumulative mode (library jargon alone)

**Page pagination**:
Pagination mode that replaces the list with one page of Products at a time, with next and previous.
_Avoid_: Google-style (metaphor), pageByPage (prop name alone when talking domain)

**Live update**:
Keeping the current page’s Product list in sync with Firestore via a snapshot listener.
_Avoid_: Realtime, onSnapshot (API name alone)
