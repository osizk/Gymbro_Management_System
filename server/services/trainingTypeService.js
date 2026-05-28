const pool = require('../db');

async function generateId(client) {
  const r = await client.query(`SELECT COALESCE(MAX(CAST(id AS INTEGER)), 0) + 1 AS next_id FROM training_type`);
  return String(r.rows[0].next_id);
}

async function getAll() {
  const r = await pool.query(
    `SELECT id, type_name, default_hourly_rate FROM training_type ORDER BY CAST(id AS INTEGER) DESC`
  );
  return r.rows;
}

async function getById(id) {
  const r = await pool.query(
    `SELECT id, type_name, default_hourly_rate FROM training_type WHERE id = $1`, [id]
  );
  return r.rows[0] || null;
}

async function create(data) {
  const { type_name, default_hourly_rate } = data;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const newId = await generateId(client);
    await client.query(
      `INSERT INTO training_type (id, type_name, default_hourly_rate) VALUES ($1,$2,$3)`,
      [newId, type_name, default_hourly_rate]
    );
    await client.query('COMMIT');
    return await getById(newId);
  } catch (err) { await client.query('ROLLBACK'); throw err; }
  finally { client.release(); }
}

async function update(id, data) {
  const { type_name, default_hourly_rate } = data;
  const check = await pool.query(`SELECT id FROM training_type WHERE id = $1`, [id]);
  if (check.rows.length === 0) throw new Error(`Training type ${id} not found`);
  await pool.query(
    `UPDATE training_type SET type_name=$1, default_hourly_rate=$2 WHERE id=$3`,
    [type_name, default_hourly_rate, id]
  );
  return await getById(id);
}

async function remove(id) {
  const r = await pool.query(`DELETE FROM training_type WHERE id = $1 RETURNING id`, [id]);
  return r.rows.length > 0;
}

module.exports = { getAll, getById, create, update, remove };
