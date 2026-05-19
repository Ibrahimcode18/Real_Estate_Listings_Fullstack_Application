# Real Estate Listings API

> A full-stack real estate listings application: a Koa-based REST API (Server) backed by MySQL and a Vite + Vue client (Client). This repository contains the API server, client UI, database SQL dumps, and tests.

## Key Features
- CRUD for properties, locations, and agents
- Role-aware endpoints and permissions
- JWT authentication for protected routes
- File uploads (property images)
- OpenAPI/Swagger schema available in `Server/schemas/openapi.yaml`

## Tech Stack
- Server: Koa, koa-router, koa-passport, passport-jwt, MySQL (mysql2), JWT, role-acl
- Client: Vue + Vite
- Tests: Jest + Supertest (server)

## Repository Structure

- `Server/` — API server and tests
  - `app.js`, `config.js`, `routes/`, `controllers/`, `models/`, `strategies/`
- `Client/` — Vue frontend (Vite)
- `real_estate_test_db.sql`, `realestate_listings.sql` — SQL schema/dumps

## Prerequisites
- Node.js (16+ recommended)
- npm
- MySQL server

## Environment variables
This project reads sensitive values from a `.env` file in `Server/`. A template is provided at `Server/.env.example` — copy it to `Server/.env` and fill in real values. Example variables used by the server:

```
# Server/.env (copy from Server/.env.example)
SECRET_KEY=your_jwt_secret_here
DB_USER=root
DB_PASSWORD=your_db_password
DB_NAME=realestate_listings
DB_NAME_TEST=real_estate_test_db
# Optional (current `Server/config.js` defaults these to localhost:3306)
DB_HOST=localhost
DB_PORT=3306
NODE_ENV=development
```

Notes on current behavior in `Server/config.js`:
- The file loads environment variables using `dotenv`.
- It reads `DB_USER`, `DB_PASSWORD`, and `DB_NAME` / `DB_NAME_TEST` from the environment.
- `DB_HOST` and `DB_PORT` currently default to `localhost` and `3306` in the code; set them in `.env` if you need different values.
- In test mode (`NODE_ENV=test`) the server uses `DB_NAME_TEST` and logs a test-mode message.

## Installation

1. Install server dependencies

```bash
cd Server
npm install
```

2. Install client dependencies

```bash
cd ../Client
npm install
```

## Database setup

1. Create the database and import the provided SQL file(s). Example (MySQL):

```bash
# from repository root
mysql -u root -p < realestate_listings.sql
# or for the test DB
mysql -u root -p < real_estate_test_db.sql
```

2. If you use `.env` for DB credentials, update `Server/config.js` to load them from `process.env` (recommended).

## Running the app

- Start the server (production):

```bash
cd Server
npm start
```

- Run server tests:

```bash
cd Server
npm test
```

- Start the client (development):

```bash
cd Client
npm run dev
```

## API Overview

The server exposes endpoints grouped under the following routers:

- `/api/users` — registration, login, user management
- `/api/agents` — agent CRUD
- `/api/locations` — location CRUD
- `/api/properties` — property CRUD, search, listing
- `/api/uploads` — file uploads (images)

For request/response schemas, see `Server/schemas/*.json` and the OpenAPI file `Server/schemas/openapi.yaml`.

### Authentication

- Authentication uses JWT. Obtain a token via the login endpoint (usually `POST /api/users/login`) and send it on protected requests in the `Authorization` header as:

```
Authorization: Bearer <JWT_TOKEN>
```

- The JWT strategy implementation is located in `Server/strategies/jwt.js`.

### Example: login then request protected resource

```bash
# Login
curl -X POST http://localhost:3000/api/users/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"user@example.com","password":"password"}'

# Use token in Authorization header
curl http://localhost:3000/api/properties \
  -H "Authorization: Bearer <TOKEN>"
```

## File uploads

The uploads router handles multipart uploads for images. Check `Server/routes/uploads.js` for route details and storage behavior.

## Testing

- Run server tests (Jest + Supertest):

```bash
cd Server
npm test
```

Tests set `NODE_ENV=test`, which selects the `real_estate_test_db` configuration in `Server/config.js`.
