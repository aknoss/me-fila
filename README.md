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

### Database

The API uses MySQL. The migrations create the tables, but you must create the
database and a user first.

1. Install and start MySQL locally (or provision a managed instance).

2. Create the database and a user (adjust the name/password as you like):

```sql
CREATE DATABASE me_fila;
CREATE USER 'me_fila'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON me_fila.* TO 'me_fila'@'localhost';
FLUSH PRIVILEGES;
```

Use `'me_fila'@'%'` instead of `'localhost'` if the database is on a different
host than the server.

3. Fill `server/.env` with the matching values:

```
JWT_SECRET=a-long-random-string
DATABASE_HOST=127.0.0.1
DATABASE_PORT=3306
DATABASE_USER=me_fila
DATABASE_PASSWORD=your_password
DATABASE_NAME=me_fila
```

4. Run the migrations to create the tables:

```
cd server
npm run migrate
```

To undo the latest migration, run `npm run rollback`.

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
