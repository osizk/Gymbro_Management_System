const pool = require('../db');

async function generateId(client) {
  const r = await client.query(`SELECT COALESCE(MAX(CAST(id AS INTEGER)), 0) + 1 AS next_id FROM equipment`);
  return String(r.rows[0].next_id);
}

async function getAll() {
  const r = await pool.query(
    `SELECT e.id, e.equipment_name, e.category_id, ec.category_name, e.purchase_date, e.status
     FROM equipment e
     LEFT JOIN equipment_category ec ON ec.id = e.category_id
     ORDER BY CAST(e.id AS INTEGER) DESC`
  );
  return r.rows;
}

async function getById(id) {
  const r = await pool.query(
    `SELECT e.id, e.equipment_name, e.category_id, ec.category_name, e.purchase_date, e.status
     FROM equipment e
     LEFT JOIN equipment_category ec ON ec.id = e.category_id
     WHERE e.id = $1`, [id]
  );
  return r.rows[0] || null;
}

async function create(data) {
  const { equipment_name, category_id, purchase_date, status } = data;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const newId = await generateId(client);
    await client.query(
      `INSERT INTO equipment (id, equipment_name, category_id, purchase_date, status) VALUES ($1,$2,$3,$4,$5)`,
      [newId, equipment_name, category_id, purchase_date, status]
    );
    await client.query('COMMIT');
    return await getById(newId);
  } catch (err) { await client.query('ROLLBACK'); throw err; }
  finally { client.release(); }
}

async function update(id, data) {
  const { equipment_name, category_id, purchase_date, status } = data;
  const check = await pool.query(`SELECT id FROM equipment WHERE id = $1`, [id]);
  if (check.rows.length === 0) throw new Error(`Equipment ${id} not found`);
  await pool.query(
    `UPDATE equipment SET equipment_name=$1, category_id=$2, purchase_date=$3, status=$4 WHERE id=$5`,
    [equipment_name, category_id, purchase_date, status, id]
  );
  return await getById(id);
}

async function remove(id) {
  const r = await pool.query(`DELETE FROM equipment WHERE id = $1 RETURNING id`, [id]);
  return r.rows.length > 0;
}

async function getAllEquipmentCategories() {
  const r = await pool.query(`SELECT id, category_name FROM equipment_category ORDER BY category_name`);
  return r.rows;
}

module.exports = { getAll, getById, create, update, remove, getAllEquipmentCategories };
