const pool = require('../db');

async function getAll() {
  const r = await pool.query(
    `SELECT p.id, p.product_name, p.category_id, pc.category_name,
            p.cost_price, p.selling_price, p.stock_quantity, p.status
     FROM product p
     LEFT JOIN product_category pc ON pc.id = p.category_id
     ORDER BY p.id DESC`
  );
  return r.rows;
}

async function getById(id) {
  const r = await pool.query(
    `SELECT p.id, p.product_name, p.category_id, pc.category_name,
            p.cost_price, p.selling_price, p.stock_quantity, p.status
     FROM product p
     LEFT JOIN product_category pc ON pc.id = p.category_id
     WHERE p.id = $1`, [id]
  );
  return r.rows[0] || null;
}

async function create(data) {
  const { product_name, category_id, cost_price, selling_price, stock_quantity, status } = data;
  const r = await pool.query(
    `INSERT INTO product (product_name, category_id, cost_price, selling_price, stock_quantity, status)
     VALUES ($1,$2,$3,$4,$5,$6) RETURNING id`,
    [product_name, category_id, cost_price, selling_price, stock_quantity, status]
  );
  return await getById(r.rows[0].id);
}

async function update(id, data) {
  const { product_name, category_id, cost_price, selling_price, stock_quantity, status } = data;
  const check = await pool.query(`SELECT id FROM product WHERE id = $1`, [id]);
  if (check.rows.length === 0) throw new Error(`Product ${id} not found`);
  await pool.query(
    `UPDATE product SET product_name=$1, category_id=$2, cost_price=$3, selling_price=$4, stock_quantity=$5, status=$6 WHERE id=$7`,
    [product_name, category_id, cost_price, selling_price, stock_quantity, status, id]
  );
  return await getById(id);
}

async function remove(id) {
  const r = await pool.query(`DELETE FROM product WHERE id = $1 RETURNING id`, [id]);
  return r.rows.length > 0;
}

async function getAllProductCategories() {
  const r = await pool.query(`SELECT id, category_name FROM product_category ORDER BY category_name`);
  return r.rows;
}

module.exports = { getAll, getById, create, update, remove, getAllProductCategories };
