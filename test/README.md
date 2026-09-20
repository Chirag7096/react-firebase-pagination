# react-firebase-pagination demo

Vite + React app that exercises the local `react-firebase-pagination` hook against Firestore.

## Setup

1. Copy env file and fill in your Firebase web config:

```bash
cp .env.example .env
```

2. In Firebase Console, enable **Firestore** and allow read/write on `products` for this demo (tighten rules later).

Example (dev only):

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /products/{id} {
      allow read, write: if true;
    }
  }
}
```

3. Install and run:

```bash
bun install
bun run dev
```

## Controls

- **Page mode** — page-by-page vs feed (load more)
- **Live update** — Firestore snapshot listener
- **Page size** — 5 / 10 / 25
- **Add product** — insert modal
- **Delete** — confirm modal on each card
