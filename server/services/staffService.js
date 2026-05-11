const pool = require('../db');

async function generateId(client) {
  const r = await client.query(`SELECT COALESCE(MAX(id), 0) + 1 AS next_id FROM staff`);
  return r.rows[0].next_id;
}

async function getAll() {
  const r = await pool.query(`SELECT id, staff_name, position, phone FROM staff ORDER BY id DESC`);
  return r.rows;
}

async function getById(id) {
  const r = await pool.query(`SELECT id, staff_name, position, phone FROM staff WHERE id = $1`, [id]);
  return r.rows[0] || null;
}

async function create(data) {
  const { staff_name, position, phone } = data;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const newId = await generateId(client);
    await client.query(
      `INSERT INTO staff (id, staff_name, position, phone) VALUES ($1,$2,$3,$4)`,
      [newId, staff_name, position, phone]
    );
    await client.query('COMMIT');
    return await getById(newId);
  } catch (err) { await client.query('ROLLBACK'); throw err; }
  finally { client.release(); }
}

async function update(id, data) {
  const { staff_name, position, phone } = data;
  const check = await pool.query(`SELECT id FROM staff WHERE id = $1`, [id]);
  if (check.rows.length === 0) throw new Error(`Staff ${id} not found`);
  await pool.query(
    `UPDATE staff SET staff_name=$1, position=$2, phone=$3 WHERE id=$4`,
    [staff_name, position, phone, id]
  );
  return await getById(id);
}

async function remove(id) {
  const r = await pool.query(`DELETE FROM staff WHERE id = $1 RETURNING id`, [id]);
  return r.rows.length > 0;
}

module.exports = { getAll, getById, create, update, remove };
