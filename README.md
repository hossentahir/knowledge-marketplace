# Teacher-Student

A minimal full-stack app with an Express.js backend and React frontend.

## Project Structure

```
├── server/     # Express.js API (port 5000)
└── client/     # Vite + React app
```

## Setup

### Backend

```bash
cd server
npm install
npm start
```

### Frontend

```bash
cd client
npm install
npm run dev
```

## Usage

1. Start the backend: `cd server && npm start`
2. Start the frontend: `cd client && npm run dev`
3. Open the dev URL (e.g. http://localhost:5173)
4. Click "Fetch Health" to verify the API connection

## API

| Endpoint      | Method | Description              |
|---------------|--------|--------------------------|
| `/api/health` | GET    | Returns `{ message: "Backend is running" }` |
