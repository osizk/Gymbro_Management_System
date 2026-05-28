const pool = require('../db');

async function generateId(client) {
  const r = await client.query(`SELECT COALESCE(MAX(id), 0) + 1 AS next_id FROM package`);
  return r.rows[0].next_id;
}

async function getAll() {
  const r = await pool.query(
    `SELECT id, package_name, duration_months, base_price, description FROM package ORDER BY id DESC`
  );
  return r.rows;
}

async function getById(id) {
  const r = await pool.query(
    `SELECT id, package_name, duration_months, base_price, description FROM package WHERE id = $1`, [id]
  );
  return r.rows[0] || null;
}

async function create(data) {
  const { package_name, duration_months, base_price, description } = data;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const newId = await generateId(client);
    await client.query(
      `INSERT INTO package (id, package_name, duration_months, base_price, description) VALUES ($1,$2,$3,$4,$5)`,
      [newId, package_name, duration_months, base_price, description || null]
    );
    await client.query('COMMIT');
    return await getById(newId);
  } catch (err) { await client.query('ROLLBACK'); throw err; }
  finally { client.release(); }
}

async function update(id, data) {
  const { package_name, duration_months, base_price, description } = data;
  const check = await pool.query(`SELECT id FROM package WHERE id = $1`, [id]);
  if (check.rows.length === 0) throw new Error(`Package ${id} not found`);
  await pool.query(
    `UPDATE package SET package_name=$1, duration_months=$2, base_price=$3, description=$4 WHERE id=$5`,
    [package_name, duration_months, base_price, description || null, id]
  );
  return await getById(id);
}

async function remove(id) {
  const r = await pool.query(`DELETE FROM package WHERE id = $1 RETURNING id`, [id]);
  return r.rows.length > 0;
}

module.exports = { getAll, getById, create, update, remove };
