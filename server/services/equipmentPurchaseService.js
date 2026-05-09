const pool = require('../db');

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function generatePurchaseId(client) {
  const year = new Date().getFullYear();
  const prefix = `EPO-${year}-`;
  const result = await client.query(
    `SELECT id FROM equipment_purchase WHERE id LIKE $1 ORDER BY id DESC LIMIT 1`,
    [`${prefix}%`]
  );
  let nextNum = 1;
  if (result.rows.length > 0) {
    const lastNum = parseInt(result.rows[0].id.split('-')[2], 10);
    nextNum = lastNum + 1;
  }
  return `${prefix}${String(nextNum).padStart(6, '0')}`;
}

async function recalcTotal(client, purchaseId) {
  await client.query(
    `UPDATE equipment_purchase
     SET total_purchase_cost = (
       SELECT COALESCE(SUM(extended_cost), 0)
       FROM equipment_purchase_item
       WHERE purchase_id = $1
     )
     WHERE id = $1`,
    [purchaseId]
  );
}

async function nextItemId(client) {
  const r = await client.query(`SELECT COALESCE(MAX(id), 0) AS max_id FROM equipment_purchase_item`);
  return parseInt(r.rows[0].max_id, 10) + 1;
}

// ─── CRUD ─────────────────────────────────────────────────────────────────────

async function getAllPurchases() {
  const result = await pool.query(
    `SELECT
       ep.id,
       ep.purchase_date,
       ep.supplier_name,
       ep.received_by_staff_id,
       s.staff_name,
       ep.method_id,
       pm.method_name,
       ep.total_purchase_cost,
       ep.created_at
     FROM equipment_purchase ep
     LEFT JOIN staff s           ON s.id  = ep.received_by_staff_id
     LEFT JOIN payment_method pm ON pm.id = ep.method_id
     ORDER BY ep.created_at DESC`
  );
  return result.rows;
}

async function getPurchaseById(id) {
  const hdr = await pool.query(
    `SELECT
       ep.id,
       ep.purchase_date,
       ep.supplier_name,
       ep.received_by_staff_id,
       s.staff_name,
       ep.method_id,
       pm.method_name,
       ep.total_purchase_cost,
       ep.created_at
     FROM equipment_purchase ep
     LEFT JOIN staff s           ON s.id  = ep.received_by_staff_id
     LEFT JOIN payment_method pm ON pm.id = ep.method_id
     WHERE ep.id = $1`,
    [id]
  );
  if (hdr.rows.length === 0) return null;

  const lines = await pool.query(
    `SELECT
       epi.id,
       epi.purchase_id,
       epi.line_no,
       epi.equipment_name,
       epi.category_id,
       ec.category_name,
       epi.quantity,
       epi.unit_cost,
       epi.warranty_months,
       epi.extended_cost
     FROM equipment_purchase_item epi
     JOIN equipment_category ec ON ec.id = epi.category_id
     WHERE epi.purchase_id = $1
     ORDER BY epi.line_no`,
    [id]
  );

  return { ...hdr.rows[0], line_items: lines.rows };
}

async function createPurchase(data) {
  const { purchase_date, supplier_name, received_by_staff_id, method_id, line_items } = data;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const purchaseId = await generatePurchaseId(client);

    await client.query(
      `INSERT INTO equipment_purchase (id, purchase_date, supplier_name, received_by_staff_id, method_id, total_purchase_cost)
       VALUES ($1, $2, $3, $4, $5, 0)`,
      [purchaseId, purchase_date, supplier_name, received_by_staff_id, method_id]
    );

    let startId = await nextItemId(client);
    for (let i = 0; i < line_items.length; i++) {
      const { equipment_name, category_id, quantity, unit_cost, warranty_months } = line_items[i];
      const extended_cost = parseInt(quantity, 10) * parseFloat(unit_cost);

      await client.query(
        `INSERT INTO equipment_purchase_item
           (id, purchase_id, line_no, equipment_name, category_id, quantity, unit_cost, warranty_months, extended_cost)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [startId + i, purchaseId, i + 1, equipment_name, category_id, quantity, unit_cost, warranty_months || 0, extended_cost]
      );
    }

    await recalcTotal(client, purchaseId);
    await client.query('COMMIT');
    return await getPurchaseById(purchaseId);
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

async function updatePurchase(id, data) {
  const { purchase_date, supplier_name, received_by_staff_id, method_id, line_items } = data;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const check = await client.query(`SELECT id FROM equipment_purchase WHERE id = $1`, [id]);
    if (check.rows.length === 0) throw new Error(`Purchase ${id} not found`);

    await client.query(
      `UPDATE equipment_purchase
       SET purchase_date = $1, supplier_name = $2, received_by_staff_id = $3, method_id = $4
       WHERE id = $5`,
      [purchase_date, supplier_name, received_by_staff_id, method_id, id]
    );

    await client.query(`DELETE FROM equipment_purchase_item WHERE purchase_id = $1`, [id]);

    let startId = await nextItemId(client);
    for (let i = 0; i < line_items.length; i++) {
      const { equipment_name, category_id, quantity, unit_cost, warranty_months } = line_items[i];
      const extended_cost = parseInt(quantity, 10) * parseFloat(unit_cost);

      await client.query(
        `INSERT INTO equipment_purchase_item
           (id, purchase_id, line_no, equipment_name, category_id, quantity, unit_cost, warranty_months, extended_cost)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [startId + i, id, i + 1, equipment_name, category_id, quantity, unit_cost, warranty_months || 0, extended_cost]
      );
    }

    await recalcTotal(client, id);
    await client.query('COMMIT');
    return await getPurchaseById(id);
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

async function deletePurchase(id) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(`DELETE FROM equipment_purchase_item WHERE purchase_id = $1`, [id]);
    const result = await client.query(
      `DELETE FROM equipment_purchase WHERE id = $1 RETURNING id`, [id]
    );
    await client.query('COMMIT');
    return result.rows.length > 0;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

// ─── Lookups ──────────────────────────────────────────────────────────────────

async function getAllStaff() {
  const result = await pool.query(
    `SELECT id, staff_name, position FROM staff ORDER BY staff_name`
  );
  return result.rows;
}

async function getAllPaymentMethods() {
  const result = await pool.query(
    `SELECT id, method_name FROM payment_method ORDER BY method_name`
  );
  return result.rows;
}

async function getAllEquipmentCategories() {
  const result = await pool.query(
    `SELECT id, category_name FROM equipment_category ORDER BY category_name`
  );
  return result.rows;
}

module.exports = {
  getAllPurchases,
  getPurchaseById,
  createPurchase,
  updatePurchase,
  deletePurchase,
  getAllStaff,
  getAllPaymentMethods,
  getAllEquipmentCategories,
};
