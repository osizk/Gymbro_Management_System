const pool = require('../db');

async function getAll() {
  const r = await pool.query(
    `SELECT id, member_name, gender, date_of_birth, phone, email, address, join_date, status
     FROM member ORDER BY id DESC`
  );
  return r.rows;
}

async function getById(id) {
  const r = await pool.query(
    `SELECT id, member_name, gender, date_of_birth, phone, email, address, join_date, status
     FROM member WHERE id = $1`, [id]
  );
  return r.rows[0] || null;
}

async function create(data) {
  const { member_name, gender, date_of_birth, phone, email, address, join_date, status } = data;
  const r = await pool.query(
    `INSERT INTO member (member_name, gender, date_of_birth, phone, email, address, join_date, status)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id`,
    [member_name, gender, date_of_birth, phone, email || null, address || null, join_date, status]
  );
  return await getById(r.rows[0].id);
}

async function update(id, data) {
  const { member_name, gender, date_of_birth, phone, email, address, join_date, status } = data;
  const check = await pool.query(`SELECT id FROM member WHERE id = $1`, [id]);
  if (check.rows.length === 0) throw new Error(`Member ${id} not found`);
  await pool.query(
    `UPDATE member SET member_name=$1, gender=$2, date_of_birth=$3, phone=$4, email=$5, address=$6, join_date=$7, status=$8 WHERE id=$9`,
    [member_name, gender, date_of_birth, phone, email || null, address || null, join_date, status, id]
  );
  return await getById(id);
}

async function remove(id) {
  const r = await pool.query(`DELETE FROM member WHERE id = $1 RETURNING id`, [id]);
  return r.rows.length > 0;
}

module.exports = { getAll, getById, create, update, remove };
