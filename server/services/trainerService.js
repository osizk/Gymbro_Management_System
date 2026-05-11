const pool = require('../db');

async function generateId(client) {
  const r = await client.query(`SELECT COALESCE(MAX(CAST(id AS INTEGER)), 0) + 1 AS next_id FROM trainer`);
  return String(r.rows[0].next_id);
}

async function getAll() {
  const r = await pool.query(
    `SELECT id, trainer_name, specialization, phone, email, commission_rate FROM trainer ORDER BY CAST(id AS INTEGER) DESC`
  );
  return r.rows;
}

async function getById(id) {
  const r = await pool.query(
    `SELECT id, trainer_name, specialization, phone, email, commission_rate FROM trainer WHERE id = $1`, [id]
  );
  return r.rows[0] || null;
}

async function create(data) {
  const { trainer_name, specialization, phone, email, commission_rate } = data;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const newId = await generateId(client);
    await client.query(
      `INSERT INTO trainer (id, trainer_name, specialization, phone, email, commission_rate) VALUES ($1,$2,$3,$4,$5,$6)`,
      [newId, trainer_name, specialization, phone, email || null, commission_rate]
    );
    await client.query('COMMIT');
    return await getById(newId);
  } catch (err) { await client.query('ROLLBACK'); throw err; }
  finally { client.release(); }
}

async function update(id, data) {
  const { trainer_name, specialization, phone, email, commission_rate } = data;
  const check = await pool.query(`SELECT id FROM trainer WHERE id = $1`, [id]);
  if (check.rows.length === 0) throw new Error(`Trainer ${id} not found`);
  await pool.query(
    `UPDATE trainer SET trainer_name=$1, specialization=$2, phone=$3, email=$4, commission_rate=$5 WHERE id=$6`,
    [trainer_name, specialization, phone, email || null, commission_rate, id]
  );
  return await getById(id);
}

async function remove(id) {
  const r = await pool.query(`DELETE FROM trainer WHERE id = $1 RETURNING id`, [id]);
  return r.rows.length > 0;
}

module.exports = { getAll, getById, create, update, remove };
