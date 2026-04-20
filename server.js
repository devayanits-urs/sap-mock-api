const express = require('express');
const { Pool } = require('pg');

const app = express();
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Create table automatically
async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS orders (
      id SERIAL PRIMARY KEY,
      opportunityId TEXT,
      accountId TEXT,
      amount NUMERIC,
      closeDate TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  console.log("Database Ready");
}

initDB();

// POST /orders
app.post('/orders', async (req, res) => {
  const { opportunityId, accountId, amount, closeDate } = req.body;

  const result = await pool.query(
    `INSERT INTO orders(opportunityId, accountId, amount, closeDate)
     VALUES($1,$2,$3,$4)
     RETURNING id`,
    [opportunityId, accountId, amount, closeDate]
  );

  res.json({
    id: result.rows[0].id,
    status: "Order Created"
  });
});

// GET /orders
app.get('/orders', async (req, res) => {
  const result = await pool.query(`SELECT * FROM orders ORDER BY id DESC`);
  res.json(result.rows);
});

app.listen(process.env.PORT || 3000, () =>
  console.log("Server Running")
);