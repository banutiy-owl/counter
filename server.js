require('dotenv').config();
const express = require('express');
const path = require('path');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3000;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    require: true,
    rejectUnauthorized: false
  }
});

app.use(express.json());
app.use(express.static('public'));

// Create table if not exists on startup
async function createTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS stats (
      date DATE PRIMARY KEY,
      count INTEGER NOT NULL
    );
  `);
}

app.get('/api/stats', async (req, res) => {
  try {
    const result = await pool.query('SELECT date, count FROM stats ORDER BY date');
    const data = {};
    result.rows.forEach(({ date, count }) => {
      // date comes as a Date object, convert to ISO string (yyyy-mm-dd)
      data[date.toISOString().split('T')[0]] = count;
    });
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error' });
  }
});

app.post('/api/update', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const delta = Number(req.body.delta);

    // Try to get existing count for today
    const existing = await pool.query('SELECT count FROM stats WHERE date = $1', [today]);

    let newCount = delta;
    if (existing.rows.length > 0) {
      newCount += existing.rows[0].count;
      await pool.query('UPDATE stats SET count = $1 WHERE date = $2', [newCount, today]);
    } else {
      await pool.query('INSERT INTO stats(date, count) VALUES($1, $2)', [today, newCount]);
    }

    res.json({ count: newCount });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error' });
  }
});

async function startServer() {
  try {
    await createTable();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
  }
}

startServer();
