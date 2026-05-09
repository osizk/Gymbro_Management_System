const pool = require('../db');

// ─── Helpers ────────────────────────────────────────────────────────────────

async function generateVoucherId(client) {
  const year = new Date().getFullYear();
  const prefix = `EXP-${year}-`;

  const result = await client.query(
    `SELECT id FROM expense_voucher
     WHERE id LIKE $1
     ORDER BY id DESC
     LIMIT 1`,
    [`${prefix}%`]
  );

  let nextNum = 1;
  if (result.rows.length > 0) {
    const lastNum = parseInt(result.rows[0].id.split('-')[2], 10);
    nextNum = lastNum + 1;
  }

  return `${prefix}${String(nextNum).padStart(6, '0')}`;
}

async function recalcTotal(client, voucherId) {
  await client.query(
    `UPDATE expense_voucher
     SET total_expense = (
       SELECT COALESCE(SUM(amount), 0)
       FROM expense_line_item
       WHERE voucher_id = $1
     )
     WHERE id = $1`,
    [voucherId]
  );
}

// ─── Service Functions ───────────────────────────────────────────────────────

async function getAllVouchers() {
  const result = await pool.query(
    `SELECT
       ev.id,
       ev.voucher_date,
       ev.vendor_name,
       ev.paid_by_staff_id,
       s.staff_name,
       ev.method_id,
       pm.method_name,
       ev.total_expense,
       ev.created_at
     FROM expense_voucher ev
     JOIN staff s         ON s.id  = ev.paid_by_staff_id
     JOIN payment_method pm ON pm.id = ev.method_id
     ORDER BY ev.created_at DESC`
  );
  return result.rows;
}

async function getVoucherById(id) {
  const headerResult = await pool.query(
    `SELECT
       ev.id,
       ev.voucher_date,
       ev.vendor_name,
       ev.paid_by_staff_id,
       s.staff_name,
       ev.method_id,
       pm.method_name,
       ev.total_expense,
       ev.created_at
     FROM expense_voucher ev
     JOIN staff s           ON s.id  = ev.paid_by_staff_id
     JOIN payment_method pm ON pm.id = ev.method_id
     WHERE ev.id = $1`,
    [id]
  );

  if (headerResult.rows.length === 0) return null;

  const lineResult = await pool.query(
    `SELECT
       eli.id,
       eli.voucher_id,
       eli.line_no,
       eli.category_id,
       ec.category_name,
       eli.amount,
       eli.description
     FROM expense_line_item eli
     JOIN expense_category ec ON ec.id = eli.category_id
     WHERE eli.voucher_id = $1
     ORDER BY eli.line_no`,
    [id]
  );

  return {
    ...headerResult.rows[0],
    line_items: lineResult.rows,
  };
}

async function createVoucher(data) {
  const { voucher_date, vendor_name, paid_by_staff_id, method_id, line_items } = data;
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const voucherId = await generateVoucherId(client);

    await client.query(
      `INSERT INTO expense_voucher (id, voucher_date, vendor_name, paid_by_staff_id, method_id, total_expense)
       VALUES ($1, $2, $3, $4, $5, 0)`,
      [voucherId, voucher_date, vendor_name, paid_by_staff_id, method_id]
    );

    for (let i = 0; i < line_items.length; i++) {
      const { category_id, amount, description } = line_items[i];

      const catCheck = await client.query(
        `SELECT id FROM expense_category WHERE id = $1`,
        [category_id]
      );
      if (catCheck.rows.length === 0) {
        throw new Error(`Expense category ID ${category_id} not found`);
      }

      await client.query(
        `INSERT INTO expense_line_item (voucher_id, line_no, category_id, amount, description)
         VALUES ($1, $2, $3, $4, $5)`,
        [voucherId, i + 1, category_id, amount, description]
      );
    }

    await recalcTotal(client, voucherId);

    await client.query('COMMIT');

    return await getVoucherById(voucherId);
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

async function updateVoucher(id, data) {
  const { voucher_date, vendor_name, paid_by_staff_id, method_id, line_items } = data;
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const check = await client.query(
      `SELECT id FROM expense_voucher WHERE id = $1`,
      [id]
    );
    if (check.rows.length === 0) {
      throw new Error(`Voucher ${id} not found`);
    }

    await client.query(
      `UPDATE expense_voucher
       SET voucher_date = $1, vendor_name = $2, paid_by_staff_id = $3, method_id = $4
       WHERE id = $5`,
      [voucher_date, vendor_name, paid_by_staff_id, method_id, id]
    );

    await client.query(
      `DELETE FROM expense_line_item WHERE voucher_id = $1`,
      [id]
    );

    for (let i = 0; i < line_items.length; i++) {
      const { category_id, amount, description } = line_items[i];

      const catCheck = await client.query(
        `SELECT id FROM expense_category WHERE id = $1`,
        [category_id]
      );
      if (catCheck.rows.length === 0) {
        throw new Error(`Expense category ID ${category_id} not found`);
      }

      await client.query(
        `INSERT INTO expense_line_item (voucher_id, line_no, category_id, amount, description)
         VALUES ($1, $2, $3, $4, $5)`,
        [id, i + 1, category_id, amount, description]
      );
    }

    await recalcTotal(client, id);

    await client.query('COMMIT');

    return await getVoucherById(id);
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

async function deleteVoucher(id) {
  const result = await pool.query(
    `DELETE FROM expense_voucher WHERE id = $1 RETURNING id`,
    [id]
  );
  return result.rows.length > 0;
}

// ─── Lookup Helpers ──────────────────────────────────────────────────────────

async function getAllExpenseCategories() {
  const result = await pool.query(
    `SELECT id, category_name FROM expense_category ORDER BY category_name`
  );
  return result.rows;
}

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

module.exports = {
  getAllVouchers,
  getVoucherById,
  createVoucher,
  updateVoucher,
  deleteVoucher,
  getAllExpenseCategories,
  getAllStaff,
  getAllPaymentMethods,
};
