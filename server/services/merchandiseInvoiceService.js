const pool = require('../db');

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Auto-generate invoice ID: INV-YYYY-NNNNNN
 * NNNNNN resets each year based on the highest existing ID for that year.
 */
async function generateInvoiceId(client) {
  const year = new Date().getFullYear();
  const prefix = `INV-${year}-`;

  const result = await client.query(
    `SELECT id FROM merchandise_invoice
     WHERE id LIKE $1
     ORDER BY id DESC
     LIMIT 1`,
    [`${prefix}%`]
  );

  let nextNum = 1;
  if (result.rows.length > 0) {
    const lastId = result.rows[0].id; // e.g. INV-2026-000042
    const lastNum = parseInt(lastId.split('-')[2], 10);
    nextNum = lastNum + 1;
  }

  return `${prefix}${String(nextNum).padStart(6, '0')}`;
}

/**
 * Recalculate and update total_amount on the invoice from its line items.
 */
async function recalcTotal(client, invoiceId) {
  await client.query(
    `UPDATE merchandise_invoice
     SET total_amount = (
       SELECT COALESCE(SUM(extended_price), 0)
       FROM merchandise_line_item
       WHERE invoice_id = $1
     )
     WHERE id = $1`,
    [invoiceId]
  );
}

// ─── Service Functions ───────────────────────────────────────────────────────

/**
 * Get all invoices with optional member name joined.
 */
async function getAllInvoices() {
  const result = await pool.query(
    `SELECT
       mi.id,
       mi.invoice_date,
       mi.member_id,
       m.member_name,
       mi.total_amount,
       mi.created_at
     FROM merchandise_invoice mi
     LEFT JOIN member m ON m.id = mi.member_id
     ORDER BY mi.created_at DESC`
  );
  return result.rows;
}

/**
 * Get a single invoice with all its line items.
 */
async function getInvoiceById(id) {
  const invoiceResult = await pool.query(
    `SELECT
       mi.id,
       mi.invoice_date,
       mi.member_id,
       m.member_name,
       mi.total_amount,
       mi.created_at
     FROM merchandise_invoice mi
     LEFT JOIN member m ON m.id = mi.member_id
     WHERE mi.id = $1`,
    [id]
  );

  if (invoiceResult.rows.length === 0) return null;

  const lineResult = await pool.query(
    `SELECT
       mli.id,
       mli.invoice_id,
       mli.line_no,
       mli.product_id,
       p.product_name,
       mli.quantity,
       mli.unit_price,
       mli.discount_pct,
       mli.extended_price
     FROM merchandise_line_item mli
     JOIN product p ON p.id = mli.product_id
     WHERE mli.invoice_id = $1
     ORDER BY mli.line_no`,
    [id]
  );

  return {
    ...invoiceResult.rows[0],
    line_items: lineResult.rows,
  };
}

/**
 * Create a new invoice with line items inside a transaction.
 * Deducts stock_quantity for each product sold.
 * @param {Object} data - { invoice_date, member_id, line_items[] }
 */
async function createInvoice(data) {
  const { invoice_date, member_id, line_items } = data;
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const invoiceId = await generateInvoiceId(client);

    // Insert the invoice (total_amount starts at 0, recalculated after lines)
    await client.query(
      `INSERT INTO merchandise_invoice (id, invoice_date, member_id, total_amount)
       VALUES ($1, $2, $3, 0)`,
      [invoiceId, invoice_date, member_id || null]
    );

    // Insert each line item + deduct stock
    for (let i = 0; i < line_items.length; i++) {
      const { product_id, quantity, unit_price, discount_pct = 0 } = line_items[i];

      // Lock the product row and check stock
      const stockResult = await client.query(
        `SELECT stock_quantity, product_name FROM product WHERE id = $1 FOR UPDATE`,
        [product_id]
      );
      if (stockResult.rows.length === 0) {
        throw new Error(`Product ID ${product_id} not found`);
      }
      const available = stockResult.rows[0].stock_quantity;
      const name      = stockResult.rows[0].product_name;
      if (quantity > available) {
        throw new Error(`Insufficient stock for "${name}". Available: ${available}`);
      }

      const extended_price = quantity * unit_price * (1 - discount_pct / 100);

      // Insert line item
      await client.query(
        `INSERT INTO merchandise_line_item
           (invoice_id, line_no, product_id, quantity, unit_price, discount_pct, extended_price)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [invoiceId, i + 1, product_id, quantity, unit_price, discount_pct, extended_price]
      );

      // Deduct stock
      await client.query(
        `UPDATE product SET stock_quantity = stock_quantity - $1 WHERE id = $2`,
        [quantity, product_id]
      );
    }

    // Recalculate total
    await recalcTotal(client, invoiceId);

    await client.query('COMMIT');

    return await getInvoiceById(invoiceId);
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Update an existing invoice and replace all its line items.
 * Restores stock from old lines, then deducts stock for new lines.
 * @param {string} id - Invoice ID
 * @param {Object} data - { invoice_date, member_id, line_items[] }
 */
async function updateInvoice(id, data) {
  const { invoice_date, member_id, line_items } = data;
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Check invoice exists
    const check = await client.query(
      `SELECT id FROM merchandise_invoice WHERE id = $1`,
      [id]
    );
    if (check.rows.length === 0) {
      throw new Error(`Invoice ${id} not found`);
    }

    // ── Step 1: Restore stock from OLD line items before deleting them ──
    const oldLines = await client.query(
      `SELECT product_id, quantity FROM merchandise_line_item WHERE invoice_id = $1`,
      [id]
    );
    for (const line of oldLines.rows) {
      await client.query(
        `UPDATE product SET stock_quantity = stock_quantity + $1 WHERE id = $2`,
        [parseFloat(line.quantity), line.product_id]
      );
    }

    // ── Step 2: Update invoice header ──
    await client.query(
      `UPDATE merchandise_invoice
       SET invoice_date = $1, member_id = $2
       WHERE id = $3`,
      [invoice_date, member_id || null, id]
    );

    // ── Step 3: Delete old line items ──
    await client.query(
      `DELETE FROM merchandise_line_item WHERE invoice_id = $1`,
      [id]
    );

    // ── Step 4: Insert new line items + deduct stock ──
    for (let i = 0; i < line_items.length; i++) {
      const { product_id, quantity, unit_price, discount_pct = 0 } = line_items[i];

      // Lock the product row and check stock
      const stockResult = await client.query(
        `SELECT stock_quantity, product_name FROM product WHERE id = $1 FOR UPDATE`,
        [product_id]
      );
      if (stockResult.rows.length === 0) {
        throw new Error(`Product ID ${product_id} not found`);
      }
      const available = stockResult.rows[0].stock_quantity;
      const name      = stockResult.rows[0].product_name;
      if (quantity > available) {
        throw new Error(`Insufficient stock for "${name}". Available: ${available}`);
      }

      const extended_price = quantity * unit_price * (1 - discount_pct / 100);

      await client.query(
        `INSERT INTO merchandise_line_item
           (invoice_id, line_no, product_id, quantity, unit_price, discount_pct, extended_price)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [id, i + 1, product_id, quantity, unit_price, discount_pct, extended_price]
      );

      // Deduct stock
      await client.query(
        `UPDATE product SET stock_quantity = stock_quantity - $1 WHERE id = $2`,
        [quantity, product_id]
      );
    }

    await recalcTotal(client, id);

    await client.query('COMMIT');

    return await getInvoiceById(id);
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Delete an invoice and restore stock for all its line items.
 */
async function deleteInvoice(id) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Restore stock from all line items before deleting
    const lines = await client.query(
      `SELECT product_id, quantity FROM merchandise_line_item WHERE invoice_id = $1`,
      [id]
    );
    for (const line of lines.rows) {
      await client.query(
        `UPDATE product SET stock_quantity = stock_quantity + $1 WHERE id = $2`,
        [parseFloat(line.quantity), line.product_id]
      );
    }

    // Delete invoice (line items removed by ON DELETE CASCADE)
    const result = await client.query(
      `DELETE FROM merchandise_invoice WHERE id = $1 RETURNING id`,
      [id]
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

// ─── Lookup Helpers (used by frontend LOVs) ─────────────────────────────────

/**
 * Get all ACTIVE products for the product LOV dropdown.
 */
async function getActiveProducts() {
  const result = await pool.query(
    `SELECT id, product_name, selling_price, stock_quantity
     FROM product
     WHERE status = 'ACTIVE'
     ORDER BY product_name`
  );
  return result.rows;
}

/**
 * Get a member by ID for auto-fill.
 */
async function getMemberById(id) {
  const result = await pool.query(
    `SELECT id, member_name, phone FROM member WHERE id = $1`,
    [id]
  );
  return result.rows[0] || null;
}

/**
 * Get all ACTIVE members for the member search modal.
 */
async function getActiveMembers() {
  const result = await pool.query(
    `SELECT id, member_name, phone
     FROM member
     WHERE status = 'ACTIVE'
     ORDER BY member_name`
  );
  return result.rows;
}

module.exports = {
  getAllInvoices,
  getInvoiceById,
  createInvoice,
  updateInvoice,
  deleteInvoice,
  getActiveProducts,
  getMemberById,
  getActiveMembers,
};