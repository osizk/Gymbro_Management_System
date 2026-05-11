const pool = require('../db');

async function generateId(client) {
  const r = await client.query(`SELECT COALESCE(MAX(CAST(id AS INTEGER)), 0) + 1 AS next_id FROM equipment_category`);
  return String(r.rows[0].next_id);
}

async function getAll() {
  const r = await pool.query(`SELECT id, category_name FROM equipment_category ORDER BY CAST(id AS INTEGER) DESC`);
  return r.rows;
}

async function getById(id) {
  const r = await pool.query(`SELECT id, category_name FROM equipment_category WHERE id = $1`, [id]);
  return r.rows[0] || null;
}

async function create(data) {
  const { category_name } = data;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const newId = await generateId(client);
    await client.query(`INSERT INTO equipment_category (id, category_name) VALUES ($1,$2)`, [newId, category_name]);
    await client.query('COMMIT');
    return await getById(newId);
  } catch (err) { await client.query('ROLLBACK'); throw err; }
  finally { client.release(); }
}

async function update(id, data) {
  const check = await pool.query(`SELECT id FROM equipment_category WHERE id = $1`, [id]);
  if (check.rows.length === 0) throw new Error(`Equipment category ${id} not found`);
  await pool.query(`UPDATE equipment_category SET category_name=$1 WHERE id=$2`, [data.category_name, id]);
  return await getById(id);
}

async function remove(id) {
  const r = await pool.query(`DELETE FROM equipment_category WHERE id = $1 RETURNING id`, [id]);
  return r.rows.length > 0;
}

module.exports = { getAll, getById, create, update, remove };
