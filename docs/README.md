# Full Stack React + Express Web App Template
 This web app is intended as a reference for a full stack web app written with a React + TailwindCSS frontend, a Node + Express backend, and a postgres database. The project runs with a single command, assuming corresponding postgres server running.



## Initializing and running the app

When cloning the project initially, you must run `npm install` in the root, /client, and /server. This is so to not bloat the repo with terabytes of node_modules and only needs to happen run once. 
<br><br> 
After the Initialization process, run `npm run dev` to run the app from here on. 

<br><br> 
If you wish to use this for a project with a different git repo, run the following in the root directory:

```
rm -rf .git
git init
```

And then link the root directory to the repo as normal

## Database

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
  - **Starting a server:** `brew services start postgresql`
  - **Restarting an existing server:** `brew services restart postgresql`
  - **Stopping a server:** `brew services stop postgresql`
