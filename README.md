# Me Fila app

Me Fila app is a web application for creating and joining queues. It is a mono repo consisted of:

- Server: restful API built in Node + Express
- Client: app built with React + Vite
- Shared: TypeScript types shared between client and server (`@me-fila/shared`)

## Setup

Install dependencies for all workspaces from the repo root:

```
npm install
```

### Client

Create a `.env` file with the backend URL. Check the `.env.example` file.

```
cd client
cp .env.example .env
```

### Server

Create a `.env` file with a JWT secret and database credentials for MySQL. Check the `.env.example` file.

```
cd server
cp .env.example .env
```

Run migrations

```
cd server
npm run migrate
```

## Development

From the repo root you can start both client and server together:

```
npm run dev
```

Or run them individually:

```
npm run dev:client
npm run dev:server
```

## Build & Production

Build the client and run database migrations from the repo root:

```
npm run build
```

This builds the React client into `server/public` and runs the pending
migrations against the database configured in `server/.env`.

Then start the server, which serves both the API and the built client from the
same origin (`/`):

```
npm run start
```

The server listens on `PORT` (defaults to `3000`).

## Testing

Both client and server use Vitest. Run from within each package:

```
cd client   # or server
npm test               # run the test suite
npm run test:coverage  # run with a coverage report
```
