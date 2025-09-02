# Me Fila app

Me Fila app is a web application for creating and joining queues. It is a mono repo consisted of:

- Server: restful API built in Node + Express and
- Client: app built with React + Vite

## Development

You will need to run both client and server at the same time to make the app work. Navigate into the related repositories and run in separate terminals

```
cd client
yarn dev
```

```
cd server
yarn dev
```

Note: You will need to setup env variables and database connection for the server. See the .env.example file

- HOST_JWT_SECRET can be anything
- USER_JWT_SECRET can be anything
- DATABASE_URL needs to be your connection to the postgresql db
