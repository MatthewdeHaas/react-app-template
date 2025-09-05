# Building and Deploying a Full-Stack React + Express + Postgres App

This article walks step by step through setting up a modern web app, explaining how each technology works individually, as well as how they all integrate. The First section sets up a fresh development environment, and the second gets the app in production using a Digital Ocean droplet and a custom Linux server.


## Quick Start
If you just want the project, run the following to get a skeleton app on your system. Keep reading for a more detailed explanation of each step and technologies involved 

```bash
# Create a new project directory
mkdir project_name # Replace with actual project name
cd project_name

# Clone repo
# The period at the end here clones the code into the current directory without creating a directory called 'react-app-template'
git clone https://github.com/MatthewdeHaas/react-app-template.git . 
rm -rf .git # .gitignore should be ok to keep
git init # Assuming you are using git; link to your remote as normal from here

# Install dependencies
npm install
cd client
npm install
cd ../server
npm install

# Setup database
brew install postgresql # If you don't have postgres already
brew services start postgresql # 'restart' instead of 'start' if the process is already on
psql -d postgres
CREATE DATABASE database_name; # change to whatever name you want for your database
\c database_name; # Connect to the database you created
\du # note who has superuser privileges when configuring .env below

# Create and configure .env
cat > .env <<EOL
DB_USER=postgres        # or your role from \du
DB_PASSWORD=            # leave blank if not set
DB_HOST=localhost
DB_PORT=5432
DB_NAME=database_name   # match the one you created - \l to list all databases
EOL

# Run servers concurrently (ensure no other processes are running on these ports)
npm run dev
```

## 1. Initial Development Setup

### 1.1 Pulling the app

Pull the skeleton app I created into your directory of choice

```bash
mkdir new_project
cd new_project
git clone https://github.com/MatthewdeHaas/react-app-template.git . 
```

Assuming you want a separate version control for this new project, it is advised to remove the version control from the skeleton app and create your own

```bash
rm -rf .git
git init
```

`.gitignore` is fine to keep, although feel free to inspect/edit it. Create a remote for the project and connect as usual from here. 

npm packages have been omitted from version control, meaning you must run `npm install` in the following three directories:

- Root (`/`) – installs project-level dev tools and scripts  
- `/client` – installs React + Tailwind dependencies  
- `/server` – installs Express + database dependencies  


### 1.2 Database setup
This app uses postgres. Install it and run the service via Homebrew

```bash
brew install postgresql
brew services start postgresql
```


Enter the postgres shell and create a new database

```bash
psql -d postgres
CREATE DATABASE my_app;
```


Note that `\l` lists the available databases (should see the new one you made here), `\c database_name` connects you to database_name, and `\dt` shows you table information on the database you are currently connected to. The database you are connected to is displayed before each line in psql. Note that you can run any valid postgres command in the terminal, so create any table you need for your app here (or via your schema). 

Create a user with privileges for the database

```bash
CREATE USER app_user WITH PASSWORD 'strong_password';
GRANT ALL PRIVILEGES ON DATABASE my_app TO app_user;
```


If running `\dt` after connecting to the database via `\c database_name` says that the owner is not the same user you just created, alter permission with

```bash
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_user;
```

This will give you full read/write privileges

Create a file in the project root called `.env`. The above code will be referencing this file. This is done to ensure sensitive information is not on GitHub. This heavily implies that this file should appear in `.gitignore`. Put this in the `.env` file and replace the with the database info you just setup with

```bash
DATABASE_URL=postgres://app_user:strong_password@localhost:5432/my_app
```

This is simpler than what is done in the quick start, where the username, password, port, etcetera are given as separate values. The above format is simpler (IMO), safer (password protected), and is usually required by third party production servers such as Heroku or Railway. 


### 1.3 Running the app

In *development*, a React dev server, as well as a Node server, must be listening on separate ports. This is not the case in production, as will be explained in the section on front end. This project is configured to run both of these ports concurrently. From the root directory, run: 

```bash
npm run dev
```

A localhost window should open on the port running the React dev server and the app is ready to code.


## 2. Back End Structure

### 2.1 Express + Node
Node is a JavaScript runtime environment with a built in web server. It opens a TCP socket and can directly accept/send requests without the need for a wsgi server. It's popular due to its robust ecosystem, asynchrony support, scalability, and standardizing a single programming language for the front and back end. Since Node acts as the back end, it must be always be running. Note that `npm run dev` is configured to run both the React dev server and the Node server. It's important to know that these are different ports serving different purposes. React Doesn't actually need a separate React dev server in production, but this will be explained further in the React section. 

Express is a library that makes writing CRUD operations easier than with with Node alone. See the CRUD section for an example of a GET request in Express.

### 2.2 CORS
This project uses something called cross origin resource sharing (CORS). This library allows for the React dev server to request data from the Node server. This is required because browsers enforce a single origin policy (SOP), so a server can't access another server from a client's browser. This prevents a malicious website from using a client's cookies or something on another website, but also causes difficulty when developing in an environment such as this. The only way SOP can be overwritten is when the server explicitly states that a particular server can send requests. This is what CORS does. You'll notice in one of the package files this is made explicit as it references the port the React dev server is listening on, meaning this is the only server that the Node server has permitted to share resources with cross origin.


### 2.3 CRUD
As mentioned, this app uses Express. Here is an example of a GET request:

```js

app.get('/api/users', authenticateToken, async (req, res) => {
  const result = await pool.query('SELECT id, name FROM users');
  res.json(result.rows);
});
```
```
```

There are three parameters to this function:

- The first is the path. Typically you use the convention `/api/*`, as it allows for requests to be proxied directly to node in production. See the section on production for more details
- The second is middleware (optional), which is an arbitrarily long list of functions that can potentially return a different value than what is in the body of the get function. See the below section on middleware for more details.
- The third is the handler. This runs after all the middleware has passed and is the body of the method call. This is where database reads/writes are done and a response is sent back to the client.

### 2.4 Middleware
As mentioned above, CRUD functions can have middleware. These are functions with the signature `f(req, res, next)` and there can be as many as one would like. req represents the incoming request, res is the response object you send back, and next is a function that passes control to the next middleware or the handler. In this example I chose an authentication middleware function, and you can imagine it would call next and proceed to the handler only if it successfully authenticated the user that hit the endpoint. If it didn't, the handler would not have run and an authentication error would be returned from this hypothetical middleware function.

In addition, there are some lines that read:

```js
app.use(express.json());
app.use(cors());
```

This middleware runs on every endpoint. This is common for JSON parsing and CORS, since most routes need them. This is essentially a substitute for passing the function as middleware into every CRUD method parameter.

## 3. Front End

### 3.1 Tailwind
The project uses tailwind, which is a CSS framework that allows CSS to be written in HTML elements. No additional setup is needed as it was installed as a client side npm package. Tailwind is perfect for rapid development/prototyping and doesn't always require extra configuration. Nonetheless, you can configure its default values, such as the default breakpoint pixel values, custom colours, more nuanced animations, etcetera. You can always write vanilla CSS as well, just link it in `index.html` as usual.


### 3.2 React
This project uses React, which is a JavaScript library that renders HTML dynamically by running client side JavaScript. React uses a nested component model, which is a collection of reusable HTML-like elements called React components. These components are written in `.jsx` files, which have a similar feel to writing plain HTML, only they compile to JavaScript at build time and allow one to handle client side swaps and AJAX requests with pure JavaScript. Note that TypeScript has become more popular for its type safety and improved debugging experience. These are simply `.tsx` files, which doesn't change anything conceptually, but perhaps important to mention to avoid confusion. 

React is often used to build  single page applications (SPA). When a client hits a route, the same singular HTML page is always returned (usually `index.html` with all the metadata). The React Router library looks at this endpoint and "hydrates" the DOM with HTML based on the React components that are written and how the router is configured to serve whichever components. At build time, these components are bundled and minified into a single JavaScript file, which is what is run in production. The react dev server allows for `.jsx` files to be in the file system and the app still run as if it were built. It's important to note that the React dev server is not relevant in production, as React doesn't server content in production, only the server does, whether that's Node or Nginx/Apache.

All front end code exists in the `/client` directory. In here you'll see the standard packages installed via `npm install`, as well as tailwind config files. The `/public` file shouldn't need to be touched apart from updating app metadata. This directory is where the `index.html` file exists that the app serves in adherences to the SPA structure. `/src` contains all of the React content. Here's the structure:

- **index.css:** contains tailwind config details as well as a few custom css classes 
- **index.js:** The parent file for all proceeding components. This is where React connects to the "root" element in `index.html` that hydrates the DOM
- **App.jsx:** This is the first of .jsx files. It is a container for the app and is typically where routing is handled. Notice at the bottom, the component, or the function, must be exported. This is the convention. It must then be imported in another file in order for it to be used. In index.js, it is imported and called like it's an HTML component (React component in this case)

This is the main hierarchy (`index.html` <- `index.js` <- `App.jsx`). The rest is just nesting components in the App.jsx element. This is analogous to creating nested html.


### 3.3 HTTP Requests - Connecting the Front End to the Back
Typically one uses the JavaScript Fetch API in a React component, which is an asynchronous resource for making HTTP requests. JSON is the typical response, and React components are built based on this response. Unlike non-SPAs, HTML is rarely returned. Instead, part of the fetch request is writing code for what happens after the request returns a response. This is where React does any DOM manipulation, it needs to. Instead of the response returning HTML, it tells the React code how to update the UI based on how the fetch response handler is written. Here's an example to make everything clear. This is a function inside of a React component that might be triggered by a button. It sends a GET request, then if the response is valid, changes the user hook to reflect the new data that was received as a response. Any error is handled accordingly as well



```jsx
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleFetchUsers = () => {
    setLoading(true);
    fetch('http://localhost:5001/api/users')
      .then(res => res.json())
      .then(data => {
        setUsers(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };
```



For completion sake, here's the return block implemented to achieve the above behaviour:
```jsx

  return (
    <div>
      <h2>User List</h2>
      <button onClick={handleFetchUsers}>
        Load Users
      </button>
    
      {loading && <p>Loading...</p>}

      <ul>
        {users.map(user => (
          <li key={user.id}> {user.name}</li>
        ))}
      </ul>
    </div>
  );
```
```
```




## 4. High level diagram
Here's a diagram of the flow of data that should help bring these technologies together:

Browser <--> React Dev Server (3000) <--> Express API (5000) <--> Postgres DB



## 5. Production

I am going to use Digital Ocean with Nginx as a http server and reverse proxy. Although hosting services like Firebase or Heroku are stable and convient, walking through setting up a Linux server from scratch I believe is more edifying and rewarding. It also gives more flexibility on what you can put on the server, including subdomains and additional websites all together. 


### 5.1 Digital Ocean droplet
Create a Digital Ocean account and purcahse a droplet congruent with your needs. The $4-6/month is plenty for a small scale web app. It should have prompted you to create an SSH key. This will make logging in very easy. Keep the droplet dashboard open or take note of the IPv4 addresses of the droplet.



### 5.2 Domain name
Every computer has a unique address assigned to it called an ip address. When a client requests data from a server, it is asking for data from the ip address on the internet that has the data of the website they are interested in. However, since these addresses lack memorability, they are replaced with a domain name. There exists a record somewhere that maps these domain names (example.com) to ip addresses of actual computers. 

You need one of these when going into production. Choose a provider and purchase. There should be some way of managing the domain you have purchased. Create an A record, which is how your domain name relates to the server you are hosting your web site code on. This A record should include a ip address. Copy the IPv4 address from your Digital Ocean Droplet here.


### 5.3 Connecting to the server

SSH into your droplet

```bash
ssh root@your.ip.address # insert your IPv4 from your droplet
```

This should put you in a Linux terminal. Run the following to update the package manager

```bash
apt update && apt upgrade -y
```


### 5.4 Installing dependencies
```bash
apt install -y nodejs npm nginx postgresql
```


### 5.5 Add app code

It is convention on Linux machines to store web servers in `/var/www/`. Go there and pull the code from your remote
```bash
cd /var/www
git clone https://github.com/yourusername/your_project.git
cd your_project
```

Follow the same process for installing node modules as in development. Note that you don't need a root-level `npm install`, as that was for tying together dev and prod when they were separate processes

```bash
cd server
npm install
cd ../client
npm install
npm run build # builds the .jsx files into 1-2 js files. Will create build/ directory
```



### 5.6 Configuring Postgres
Postgres runs on a server, unlike sqlite, which is a file that is written/read on the system. Postgres runs as its own service manages its own directory. This negates the worry about file write permissions. Since you interact with postgres over the TCP connection it opens, permissions are a matter of roles and grants. 

Open the psql shell and create a new database

```bash
sudo psql -d postgres
CREATE DATABASE my_app;
```

Create a dedicated database user and grant it permissions

```bash
CREATE USER app_user WITH PASSWORD 'strong_password';
GRANT ALL PRIVILEGES ON DATABASE my_app TO app_user;
```

Configure .env

```bash
DATABASE_URL=postgres://app_user:strong_password@localhost:5432/my_app
```

Note that `server.js` references this file and thus does not need to be changed. Test if the user can connect

```bash
psql -U myapp_user -d myapp -h localhost -W
```




### 5.7 Configuring Nginx
Create a server block with the following

```bash
vim /etc/nginx/sites-available/your_project
```

Paste the following in and replace with your information:

```bash

server {
    listen 80;
    server_name example.com www.example.com;

    root /var/www/app/client/build;
    index index.html;

    location / {
        try_files $uri /index.html;
    }

    location /api/ {
        proxy_pass http://localhost:5000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Notice how the `/api/` location directly proxies to node, and the generic `/` location first tries to find a static file on the system, and if it doesn't, it serves `index.html`. This means the page hit a route. This is the core of an SPA. React's router takes care of hydrating this html shell dynamically.

Create a symbolic link

```bash
ln -s /etc/nginx/sites-available/app /etc/nginx/sites-enabled/
```

Test Nginx. If successful, restart

```bash
nginx -t
systemctl restart nginx
```



### 5.8 Running the Node server
You need a process manager for Node so it won't crash on an error or when you leave your SSH session. This is the equivalent of creating a systemd service file

```bash
npm install -g pm2
cd /var/www/your_project/server
pm2 start server.js --name app
pm2 startup systemd
pm2 save
```


### 5.9 Adding HTTPS
You need a third party SSL certificate to serve content via HTTPS. LetsEncrypt offers these. Install and use Certbot

```bash
apt install -y certbot python3-certbot-nginx
certbot --nginx -d example.com -d www.example.com
```


If everything worked correctly, you should be able to access your React app on the internet like any other site.




