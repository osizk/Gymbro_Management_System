const pool = require('../db');

async function generateId(client) {
  const r = await client.query(`SELECT COALESCE(MAX(CAST(id AS INTEGER)), 0) + 1 AS next_id FROM class_booking`);
  return String(r.rows[0].next_id);
}

async function getAll() {
  const r = await pool.query(
    `SELECT cb.id, cb.class_id, c.class_name, cb.member_id, m.member_name,
            cb.booking_date, cb.status, cb.check_in_time
     FROM class_booking cb
     LEFT JOIN class c ON c.id = cb.class_id
     LEFT JOIN member m ON m.id = cb.member_id
     ORDER BY CAST(cb.id AS INTEGER) DESC`
  );
  return r.rows;
}

async function getById(id) {
  const r = await pool.query(
    `SELECT cb.id, cb.class_id, c.class_name, cb.member_id, m.member_name,
            cb.booking_date, cb.status, cb.check_in_time
     FROM class_booking cb
     LEFT JOIN class c ON c.id = cb.class_id
     LEFT JOIN member m ON m.id = cb.member_id
     WHERE cb.id = $1`, [id]
  );
  return r.rows[0] || null;
}

async function create(data) {
  const { class_id, member_id, booking_date, status, check_in_time } = data;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const newId = await generateId(client);
    await client.query(
      `INSERT INTO class_booking (id, class_id, member_id, booking_date, status, check_in_time) VALUES ($1,$2,$3,$4,$5,$6)`,
      [newId, class_id, member_id, booking_date, status, check_in_time || null]
    );
    await client.query('COMMIT');
    return await getById(newId);
  } catch (err) { await client.query('ROLLBACK'); throw err; }
  finally { client.release(); }
}

async function update(id, data) {
  const { class_id, member_id, booking_date, status, check_in_time } = data;
  const check = await pool.query(`SELECT id FROM class_booking WHERE id = $1`, [id]);
  if (check.rows.length === 0) throw new Error(`Class booking ${id} not found`);
  await pool.query(
    `UPDATE class_booking SET class_id=$1, member_id=$2, booking_date=$3, status=$4, check_in_time=$5 WHERE id=$6`,
    [class_id, member_id, booking_date, status, check_in_time || null, id]
  );
  return await getById(id);
}

async function remove(id) {
  const r = await pool.query(`DELETE FROM class_booking WHERE id = $1 RETURNING id`, [id]);
  return r.rows.length > 0;
}

async function getAllClasses() {
  const r = await pool.query(`SELECT id, class_name, schedule_day FROM class ORDER BY class_name`);
  return r.rows;
}

async function getAllMembers() {
  const r = await pool.query(`SELECT id, member_name, phone FROM member WHERE status = 'ACTIVE' ORDER BY member_name`);
  return r.rows;
}

module.exports = { getAll, getById, create, update, remove, getAllClasses, getAllMembers };
