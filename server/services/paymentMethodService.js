const pool = require('../db');

async function generateId(client) {
  const r = await client.query(`SELECT COALESCE(MAX(id), 0) + 1 AS next_id FROM payment_method`);
  return r.rows[0].next_id;
}

async function getAll() {
  const r = await pool.query(`SELECT id, method_name FROM payment_method ORDER BY id DESC`);
  return r.rows;
}

async function getById(id) {
  const r = await pool.query(`SELECT id, method_name FROM payment_method WHERE id = $1`, [id]);
  return r.rows[0] || null;
}

async function create(data) {
  const { method_name } = data;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const newId = await generateId(client);
    await client.query(`INSERT INTO payment_method (id, method_name) VALUES ($1,$2)`, [newId, method_name]);
    await client.query('COMMIT');
    return await getById(newId);
  } catch (err) { await client.query('ROLLBACK'); throw err; }
  finally { client.release(); }
}

async function update(id, data) {
  const check = await pool.query(`SELECT id FROM payment_method WHERE id = $1`, [id]);
  if (check.rows.length === 0) throw new Error(`Payment method ${id} not found`);
  await pool.query(`UPDATE payment_method SET method_name=$1 WHERE id=$2`, [data.method_name, id]);
  return await getById(id);
}

async function remove(id) {
  const r = await pool.query(`DELETE FROM payment_method WHERE id = $1 RETURNING id`, [id]);
  return r.rows.length > 0;
}

module.exports = { getAll, getById, create, update, remove };
