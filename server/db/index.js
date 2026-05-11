require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'gymbro_admin',
  password: process.env.DB_PASSWORD || '1111',
  database: process.env.DB_NAME || 'gymbro_db',
  port: 5432,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

module.exports = pool;