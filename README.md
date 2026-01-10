# Me Fila app

Me Fila app is a web application for creating and joining queues. It is a mono repo consisted of:

- Server: restful API built in Node + Express and
- Client: app built with React + Vite

## Setup

### Client

Run npm install

```
cd client
npm install
```

### Server

Create a .env file with these values:

```
- HOST_JWT_SECRET: can be any string
- USER_JWT_SECRET: can be any string
- DATABASE_URL: needs to be your connection to the postgresql db
```

Run migrations

```
cd server
npx prisma migrate dev
```

Run npm install

```
cd server
npm install
```

## Development

You will need to run both client and server at the same time to make the app work. Navigate into the related repositories and run in separate terminals

### Client

```
cd client
npm run dev
```

### Server

```
cd server
npm run dev
```
