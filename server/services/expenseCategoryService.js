const pool = require('../db');

async function generateId(client) {
  const r = await client.query(`SELECT COALESCE(MAX(id), 0) + 1 AS next_id FROM expense_category`);
  return r.rows[0].next_id;
}

async function getAll() {
  const r = await pool.query(`SELECT id, category_name FROM expense_category ORDER BY id DESC`);
  return r.rows;
}

async function getById(id) {
  const r = await pool.query(`SELECT id, category_name FROM expense_category WHERE id = $1`, [id]);
  return r.rows[0] || null;
}

async function create(data) {
  const { category_name } = data;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const newId = await generateId(client);
    await client.query(`INSERT INTO expense_category (id, category_name) VALUES ($1,$2)`, [newId, category_name]);
    await client.query('COMMIT');
    return await getById(newId);
  } catch (err) { await client.query('ROLLBACK'); throw err; }
  finally { client.release(); }
}

async function update(id, data) {
  const check = await pool.query(`SELECT id FROM expense_category WHERE id = $1`, [id]);
  if (check.rows.length === 0) throw new Error(`Expense category ${id} not found`);
  await pool.query(`UPDATE expense_category SET category_name=$1 WHERE id=$2`, [data.category_name, id]);
  return await getById(id);
}

async function remove(id) {
  const r = await pool.query(`DELETE FROM expense_category WHERE id = $1 RETURNING id`, [id]);
  return r.rows.length > 0;
}

module.exports = { getAll, getById, create, update, remove };
