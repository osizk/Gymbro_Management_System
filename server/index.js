require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'gymbro_admin',
  password: process.env.DB_PASSWORD || 'your_password',
  database: process.env.DB_NAME || 'gymbro_db',
  port: 5432,
});

// Function to retry database connection until it's ready
const connectWithRetry = async () => {
  try {
    await pool.connect();
    console.log('Successfully connected to the GymBro PostgreSQL database!');
  } catch (err) {
    console.error('Database not ready yet. Retrying in 5 seconds...', err.message);
    setTimeout(connectWithRetry, 5000);
  }
};

connectWithRetry();

app.get('/api/v1/test', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW() AS current_time');
    res.json({
      status: 'Success',
      message: 'Backend and Database are officially linked!',
      db_time: result.rows[0].current_time
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(port, () => {
  console.log(`Backend server is running on port ${port}`);
});