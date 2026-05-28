const pool = require('../db');

async function generateId(client) {
  const year = new Date().getFullYear();
  const prefix = `MNT-${year}-`;
  const r = await client.query(
    `SELECT id FROM maintenance_ticket WHERE id LIKE $1 ORDER BY id DESC LIMIT 1`, [`${prefix}%`]
  );
  let nextNum = 1;
  if (r.rows.length > 0) {
    nextNum = parseInt(r.rows[0].id.split('-')[2], 10) + 1;
  }
  return `${prefix}${String(nextNum).padStart(6, '0')}`;
}

async function getAll() {
  const r = await pool.query(
    `SELECT mt.id, mt.equipment_id, e.equipment_name, mt.report_date,
            mt.issue_description, mt.technician_id, s.staff_name,
            mt.status, mt.repair_cost
     FROM maintenance_ticket mt
     LEFT JOIN equipment e ON e.id = mt.equipment_id
     LEFT JOIN staff s ON s.id = mt.technician_id
     ORDER BY mt.report_date DESC`
  );
  return r.rows;
}

async function getById(id) {
  const r = await pool.query(
    `SELECT mt.id, mt.equipment_id, e.equipment_name, mt.report_date,
            mt.issue_description, mt.technician_id, s.staff_name,
            mt.status, mt.repair_cost
     FROM maintenance_ticket mt
     LEFT JOIN equipment e ON e.id = mt.equipment_id
     LEFT JOIN staff s ON s.id = mt.technician_id
     WHERE mt.id = $1`, [id]
  );
  return r.rows[0] || null;
}

async function create(data) {
  const { equipment_id, report_date, issue_description, technician_id, status, repair_cost } = data;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const newId = await generateId(client);
    await client.query(
      `INSERT INTO maintenance_ticket (id, equipment_id, report_date, issue_description, technician_id, status, repair_cost)
       VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      [newId, equipment_id, report_date, issue_description, technician_id, status, repair_cost || null]
    );
    await client.query('COMMIT');
    return await getById(newId);
  } catch (err) { await client.query('ROLLBACK'); throw err; }
  finally { client.release(); }
}

async function update(id, data) {
  const { equipment_id, report_date, issue_description, technician_id, status, repair_cost } = data;
  const check = await pool.query(`SELECT id FROM maintenance_ticket WHERE id = $1`, [id]);
  if (check.rows.length === 0) throw new Error(`Ticket ${id} not found`);
  await pool.query(
    `UPDATE maintenance_ticket SET equipment_id=$1, report_date=$2, issue_description=$3, technician_id=$4, status=$5, repair_cost=$6 WHERE id=$7`,
    [equipment_id, report_date, issue_description, technician_id, status, repair_cost || null, id]
  );
  return await getById(id);
}

async function remove(id) {
  const r = await pool.query(`DELETE FROM maintenance_ticket WHERE id = $1 RETURNING id`, [id]);
  return r.rows.length > 0;
}

async function getAllEquipment() {
  const r = await pool.query(`SELECT id, equipment_name FROM equipment ORDER BY equipment_name`);
  return r.rows;
}

async function getAllStaff() {
  const r = await pool.query(`SELECT id, staff_name, position FROM staff ORDER BY staff_name`);
  return r.rows;
}

module.exports = { getAll, getById, create, update, remove, getAllEquipment, getAllStaff };
