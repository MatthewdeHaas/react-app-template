// server/index.js
const express = require('express');
const app = express();
const cors = require('cors')
const PORT = 5001;
const { Pool } = require('pg');

// Middleware example
app.use(express.json());
app.use(cors());


// Postgres connection config
const pool = new Pool({
  database: "postgres",
});



app.get('/api/users', async (req, res) => {
  const result = await pool.query('SELECT id, name FROM users');
  res.json(result.rows);
});

app.post('/api/users', async (req, res) => {
  const { name } = req.body;
  const result = await pool.query(
    'INSERT INTO users (name) VALUES ($1) RETURNING *',
    [name]
  );
  res.status(201).json(result.rows[0]);
});



// Start server
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
