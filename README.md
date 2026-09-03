# Notes App Backend

A REST API backend for a notes application, built with Node.js, Express 5, and MongoDB (Mongoose). Provides full CRUD operations for notes plus a sliding-window rate limiter powered by Upstash Redis, CORS allowlisting for deployed and local clients, and structured JSON error/success responses.

## Overview

This project is the backend-only portion of a notes app. It includes:

- An Express 5 server with JSON body parsing
- Mongoose model and controller layer for notes (title + content + timestamps)
- RESTful note routes: list, fetch one, create, update, delete
- Global sliding-window rate limiting (100 requests per 60 seconds) via Upstash Redis
- CORS allowlist for both the deployed frontend and local Vite dev server
- MongoDB connection helper with hard fail on connection error
- Structured JSON responses with `status`, `message`, and data fields
- A request logger that explicitly highlights `cron-job.org` keep-alive pings

## Tech Stack

- Node.js (ES Modules)
- Express 5.x
- MongoDB + Mongoose 8.x
- Upstash Redis via `@upstash/redis`
- Upstash Rate Limiting via `@upstash/ratelimit` (sliding window)
- CORS (express `cors` middleware)
- dotenv for environment configuration

## Project Structure

```text
notes-app-backend/
├── src/
│   ├── config/
│   │   ├── db.js          # Mongoose connect helper
│   │   └── upstash.js     # Upstash Redis + Ratelimit setup
│   ├── controllers/
│   │   └── noteControllers.js   # CRUD handlers for notes
│   ├── middlewares/
│   │   └── rateLimiter.js       # Upstash rate-limit middleware
│   ├── models/
│   │   └── Note.js        # Mongoose Note schema (title, content, timestamps)
│   ├── routes/
│   │   └── noteRoutes.js  # /api/notes REST route definitions
│   └── server.js          # App entry, middleware wiring, listener startup
├── package.json
└── README.md
```

## Features

### Notes CRUD
- **List notes** — `GET /api/notes` returns all notes sorted newest-first by `createdAt`
- **Fetch a note** — `GET /api/notes/:id` returns a single note by ID (404 if missing)
- **Create a note** — `POST /api/notes` with `{title, content}`; both fields are required (400 if missing)
- **Update a note** — `PUT /api/notes/:id` updates `title` and/or `content`; returns the updated document (404 if missing)
- **Delete a note** — `DELETE /api/notes/:id` removes a note and returns the deleted doc (404 if missing)

### Rate Limiting
- Global sliding-window limit of **100 requests per 60 seconds** applied to all routes
- Uses Upstash Redis REST API (`@upstash/redis` + `@upstash/ratelimit`)
- Responds with `429 { status: "error", message: "Rate limit exceeded" }` when tripped
- Falls back to 500 if the rate limiter itself errors

### CORS
- Two allowed origins are configured:
  - Deployed frontend: `https://notes2.hegesecure.com`
  - Local Vite dev server: `http://localhost:5173`

### Request Logging
- All requests pass through a timestamped logger.
- Requests whose `User-Agent` contains `cron-job.org` are explicitly logged with a bell emoji and IP — useful for monitoring keep-alive pings on free-tier hosts.

### Response Shape
Every JSON response from the API uses the same envelope:

```json
{
  "status": "success | error",
  "message": "...",
  "notes": [...],       // list endpoint
  "note": { ... }       // single-note endpoint (where applicable)
}
```

## Environment Variables

Create a `.env` file in the project root:

```env
PORT=3005
MONGODB_URL=your_mongodb_connection_string

UPSTASH_REDIS_REST_URL=your_upstash_redis_rest_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_redis_rest_token

# Optional, used for the commented-out static-serving block:
# NODE_ENV=production
```

## Installation

```bash
npm install
```

## Running Locally

### With file watching (dev):

```bash
npm run dev
```

This uses Node's built-in watcher (`node --watch`) plus `--trace-warnings`.

### Production start:

```bash
npm start
```

The server runs on the `PORT` env var, defaulting to:

```text
http://localhost:3005
```

Startup depends on a successful MongoDB connection — if MongoDB fails to connect, the process exits with code `1`.

## Available Scripts

```bash
npm run dev   # start with --watch and --trace-warnings
npm start     # start with plain node
npm test      # placeholder (currently echoes "Error: no test specified")
```

## API Endpoints

Base path: `/api/notes`. All endpoints are subject to the global Upstash rate limiter.

| Method   | Endpoint           | Description                                   | Request Body                 |
|----------|--------------------|-----------------------------------------------|------------------------------|
| `GET`    | `/api/notes`       | List all notes sorted newest-first            | —                            |
| `GET`    | `/api/notes/:id`   | Get one note by ID                            | —                            |
| `POST`   | `/api/notes`       | Create a new note (title + content required)  | `{ "title", "content" }`     |
| `PUT`    | `/api/notes/:id`   | Update a note's title and/or content          | `{ "title?", "content?" }`   |
| `DELETE` | `/api/notes/:id`   | Delete a note                                 | —                            |

### Example — Create a note

```bash
curl -X POST http://localhost:3005/api/notes \
  -H "Content-Type: application/json" \
  -d '{ "title": "Shopping list", "content": "- milk\n- eggs" }'
```

## Notes

- The rate-limiter currently uses a single shared `limit-key` for all clients; per-IP or per-user keys can be added later.
- `server.js` contains a commented-out production static-serving block that would serve a frontend built at `../frontend/dist`; it is disabled in the current code.
- `createdAt` and `updatedAt` are automatically managed by Mongoose timestamps on the `Note` schema.
