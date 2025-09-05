const express = require('express');
const app = express();
const cors = require('cors')
const PORT = 5001;
const { Pool } = require('pg');
const dotenv = require("dotenv");


// Establish middleware
app.use(express.json());
app.use(cors());

// configure .env file
dotenv.config(); 

// Create a database pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});


// Start server
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
