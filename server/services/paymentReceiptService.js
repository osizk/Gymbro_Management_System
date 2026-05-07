const pool = require('../db');

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function generateReceiptId(client) {
  const year = new Date().getFullYear();
  const prefix = `RCP-${year}-`;
  const result = await client.query(
    `SELECT id FROM payment_receipt WHERE id LIKE $1 ORDER BY id DESC LIMIT 1`,
    [`${prefix}%`]
  );
  let nextNum = 1;
  if (result.rows.length > 0) {
    const lastNum = parseInt(result.rows[0].id.split('-')[2], 10);
    nextNum = lastNum + 1;
  }
  return `${prefix}${String(nextNum).padStart(6, '0')}`;
}

async function recalcTotal(client, receiptId) {
  await client.query(
    `UPDATE payment_receipt
     SET total_paid = (
       SELECT COALESCE(SUM(amount_paid), 0)
       FROM receipt_line_item
       WHERE receipt_id = $1
     )
     WHERE id = $1`,
    [receiptId]
  );
}

async function nextLineItemId(client) {
  const r = await client.query(`SELECT COALESCE(MAX(id), 0) AS max_id FROM receipt_line_item`);
  return parseInt(r.rows[0].max_id, 10) + 1;
}

// ─── CRUD ─────────────────────────────────────────────────────────────────────

async function getAllReceipts() {
  const result = await pool.query(
    `SELECT
       pr.id,
       pr.receipt_date,
       pr.member_id,
       m.member_name,
       pr.method_id,
       pm.method_name,
       pr.payment_reference_no,
       pr.total_paid,
       pr.created_at
     FROM payment_receipt pr
     LEFT JOIN member m         ON m.id  = pr.member_id
     LEFT JOIN payment_method pm ON pm.id = pr.method_id
     ORDER BY pr.created_at DESC`
  );
  return result.rows;
}

async function getReceiptById(id) {
  const hdr = await pool.query(
    `SELECT
       pr.id,
       pr.receipt_date,
       pr.member_id,
       m.member_name,
       pr.method_id,
       pm.method_name,
       pr.payment_reference_no,
       pr.total_paid,
       pr.created_at
     FROM payment_receipt pr
     LEFT JOIN member m         ON m.id  = pr.member_id
     LEFT JOIN payment_method pm ON pm.id = pr.method_id
     WHERE pr.id = $1`,
    [id]
  );
  if (hdr.rows.length === 0) return null;

  const lines = await pool.query(
    `SELECT id, receipt_id, line_no, reference_type, reference_no, amount_paid, remaining_balance, notes
     FROM receipt_line_item
     WHERE receipt_id = $1
     ORDER BY line_no`,
    [id]
  );

  return { ...hdr.rows[0], line_items: lines.rows };
}

async function createReceipt(data) {
  const { receipt_date, member_id, method_id, payment_reference_no, line_items } = data;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const receiptId = await generateReceiptId(client);

    await client.query(
      `INSERT INTO payment_receipt (id, receipt_date, member_id, method_id, payment_reference_no, total_paid)
       VALUES ($1, $2, $3, $4, $5, 0)`,
      [receiptId, receipt_date, member_id, method_id, payment_reference_no || null]
    );

    let startId = await nextLineItemId(client);
    for (let i = 0; i < line_items.length; i++) {
      const { reference_type, reference_no, amount_paid, remaining_balance, notes } = line_items[i];
      await client.query(
        `INSERT INTO receipt_line_item
           (id, receipt_id, line_no, reference_type, reference_no, amount_paid, remaining_balance, notes)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [startId + i, receiptId, i + 1, reference_type, reference_no, amount_paid, remaining_balance || null, notes || null]
      );
    }

    await recalcTotal(client, receiptId);
    await client.query('COMMIT');
    return await getReceiptById(receiptId);
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

async function updateReceipt(id, data) {
  const { receipt_date, member_id, method_id, payment_reference_no, line_items } = data;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const check = await client.query(`SELECT id FROM payment_receipt WHERE id = $1`, [id]);
    if (check.rows.length === 0) throw new Error(`Receipt ${id} not found`);

    await client.query(
      `UPDATE payment_receipt
       SET receipt_date = $1, member_id = $2, method_id = $3, payment_reference_no = $4
       WHERE id = $5`,
      [receipt_date, member_id, method_id, payment_reference_no || null, id]
    );

    await client.query(`DELETE FROM receipt_line_item WHERE receipt_id = $1`, [id]);

    let startId = await nextLineItemId(client);
    for (let i = 0; i < line_items.length; i++) {
      const { reference_type, reference_no, amount_paid, remaining_balance, notes } = line_items[i];
      await client.query(
        `INSERT INTO receipt_line_item
           (id, receipt_id, line_no, reference_type, reference_no, amount_paid, remaining_balance, notes)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [startId + i, id, i + 1, reference_type, reference_no, amount_paid, remaining_balance || null, notes || null]
      );
    }

    await recalcTotal(client, id);
    await client.query('COMMIT');
    return await getReceiptById(id);
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

async function deleteReceipt(id) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(`DELETE FROM receipt_line_item WHERE receipt_id = $1`, [id]);
    const result = await client.query(
      `DELETE FROM payment_receipt WHERE id = $1 RETURNING id`, [id]
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

async function getAllPaymentMethods() {
  const result = await pool.query(
    `SELECT id, method_name FROM payment_method ORDER BY method_name`
  );
  return result.rows;
}

module.exports = {
  getAllReceipts,
  getReceiptById,
  createReceipt,
  updateReceipt,
  deleteReceipt,
  getAllPaymentMethods,
};
