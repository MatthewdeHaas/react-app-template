# Full Stack React App Template
 This web app is intended as a reference for a full stack web app written with a React + TailwindCSS frontend, a Node + Express backend, and a postgres database. The project runs with a single command, assuming corresponding postgres server running.



## Running the app

`npm run dev` in the root directory


## Database references

- The database config can be found in server/server.js. The following is a template for the `pool` object. You must include `database` as a key, while the others a optional:


```js

const pool = new Pool({
  user: "superuser",
  host: "localhost", // Usually the case for development
  database: "db-name", // name of postgres db. There always is a db called 'postgres'
  password: "pass",
  port: "5432", // Default port for postgres unless changed manually
});
```

- The project requires a postgres server to run. Here are some useful commands
  - **Starting the server:** `brew services start postgresql`
  - **Restarting an existing server:** `brew services restart postgresql`
  - **Stopping a server:** `brew services stop postgresql`
