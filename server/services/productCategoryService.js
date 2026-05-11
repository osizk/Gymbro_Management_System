const pool = require('../db');

async function getAll() {
  const r = await pool.query(`SELECT id, category_name FROM product_category ORDER BY id DESC`);
  return r.rows;
}

async function getById(id) {
  const r = await pool.query(`SELECT id, category_name FROM product_category WHERE id = $1`, [id]);
  return r.rows[0] || null;
}

async function create(data) {
  const r = await pool.query(
    `INSERT INTO product_category (category_name) VALUES ($1) RETURNING id`, [data.category_name]
  );
  return await getById(r.rows[0].id);
}

async function update(id, data) {
  const check = await pool.query(`SELECT id FROM product_category WHERE id = $1`, [id]);
  if (check.rows.length === 0) throw new Error(`Product category ${id} not found`);
  await pool.query(`UPDATE product_category SET category_name=$1 WHERE id=$2`, [data.category_name, id]);
  return await getById(id);
}

async function remove(id) {
  const r = await pool.query(`DELETE FROM product_category WHERE id = $1 RETURNING id`, [id]);
  return r.rows.length > 0;
}

module.exports = { getAll, getById, create, update, remove };
