const pool = require('../db');

async function generateId(client) {
  const r = await client.query(`SELECT COALESCE(MAX(CAST(id AS INTEGER)), 0) + 1 AS next_id FROM class`);
  return String(r.rows[0].next_id);
}

async function getAll() {
  const r = await pool.query(
    `SELECT id, class_name, schedule_day, start_time, end_time, max_capacity, class_price
     FROM class ORDER BY CAST(id AS INTEGER) DESC`
  );
  return r.rows;
}

async function getById(id) {
  const r = await pool.query(
    `SELECT id, class_name, schedule_day, start_time, end_time, max_capacity, class_price FROM class WHERE id = $1`, [id]
  );
  return r.rows[0] || null;
}

async function create(data) {
  const { class_name, schedule_day, start_time, end_time, max_capacity, class_price } = data;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const newId = await generateId(client);
    await client.query(
      `INSERT INTO class (id, class_name, schedule_day, start_time, end_time, max_capacity, class_price) VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      [newId, class_name, schedule_day, start_time, end_time, max_capacity, class_price]
    );
    await client.query('COMMIT');
    return await getById(newId);
  } catch (err) { await client.query('ROLLBACK'); throw err; }
  finally { client.release(); }
}

async function update(id, data) {
  const { class_name, schedule_day, start_time, end_time, max_capacity, class_price } = data;
  const check = await pool.query(`SELECT id FROM class WHERE id = $1`, [id]);
  if (check.rows.length === 0) throw new Error(`Class ${id} not found`);
  await pool.query(
    `UPDATE class SET class_name=$1, schedule_day=$2, start_time=$3, end_time=$4, max_capacity=$5, class_price=$6 WHERE id=$7`,
    [class_name, schedule_day, start_time, end_time, max_capacity, class_price, id]
  );
  return await getById(id);
}

async function remove(id) {
  const r = await pool.query(`DELETE FROM class WHERE id = $1 RETURNING id`, [id]);
  return r.rows.length > 0;
}

module.exports = { getAll, getById, create, update, remove };
