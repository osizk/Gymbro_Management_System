const pool = require('../db');

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function generateSubscriptionId(client) {
  const year = new Date().getFullYear();
  const prefix = `SUB-${year}-`;
  const result = await client.query(
    `SELECT id FROM subscription WHERE id LIKE $1 ORDER BY id DESC LIMIT 1`,
    [`${prefix}%`]
  );
  let nextNum = 1;
  if (result.rows.length > 0) {
    const lastNum = parseInt(result.rows[0].id.split('-')[2], 10);
    nextNum = lastNum + 1;
  }
  return `${prefix}${String(nextNum).padStart(6, '0')}`;
}

async function recalcTotal(client, subscriptionId) {
  await client.query(
    `UPDATE subscription
     SET total_amount = (
       SELECT COALESCE(SUM(extended_price), 0)
       FROM subscription_line_item
       WHERE subscription_id = $1
     )
     WHERE id = $1`,
    [subscriptionId]
  );
}

// ─── CRUD ─────────────────────────────────────────────────────────────────────

async function getAllSubscriptions() {
  const result = await pool.query(
    `SELECT
       s.id,
       s.subscription_date,
       s.member_id,
       m.member_name,
       s.status,
       s.total_amount,
       s.created_at
     FROM subscription s
     LEFT JOIN member m ON m.id = s.member_id
     ORDER BY s.created_at DESC`
  );
  return result.rows;
}

async function getSubscriptionById(id) {
  const subResult = await pool.query(
    `SELECT
       s.id,
       s.subscription_date,
       s.member_id,
       m.member_name,
       s.status,
       s.total_amount,
       s.created_at
     FROM subscription s
     LEFT JOIN member m ON m.id = s.member_id
     WHERE s.id = $1`,
    [id]
  );
  if (subResult.rows.length === 0) return null;

  const lineResult = await pool.query(
    `SELECT
       sli.id,
       sli.subscription_id,
       sli.line_no,
       sli.package_id,
       p.package_name,
       p.duration_months,
       sli.start_date,
       sli.end_date,
       sli.base_price,
       sli.discount_pct,
       sli.extended_price
     FROM subscription_line_item sli
     JOIN package p ON p.id = sli.package_id
     WHERE sli.subscription_id = $1
     ORDER BY sli.line_no`,
    [id]
  );

  return {
    ...subResult.rows[0],
    line_items: lineResult.rows,
  };
}

async function createSubscription(data) {
  const { subscription_date, member_id, status, line_items } = data;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const subId = await generateSubscriptionId(client);

    await client.query(
      `INSERT INTO subscription (id, subscription_date, member_id, status, total_amount)
       VALUES ($1, $2, $3, $4, 0)`,
      [subId, subscription_date, member_id, status]
    );

    for (let i = 0; i < line_items.length; i++) {
      const { package_id, start_date, end_date, base_price, discount_pct = 0 } = line_items[i];
      const extended_price = parseFloat(base_price) * (1 - parseFloat(discount_pct) / 100);

      await client.query(
        `INSERT INTO subscription_line_item
           (subscription_id, line_no, package_id, start_date, end_date, base_price, discount_pct, extended_price)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [subId, i + 1, package_id, start_date, end_date, base_price, discount_pct, extended_price]
      );
    }

    await recalcTotal(client, subId);
    await client.query('COMMIT');
    return await getSubscriptionById(subId);
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

async function updateSubscription(id, data) {
  const { subscription_date, member_id, status, line_items } = data;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const check = await client.query(`SELECT id FROM subscription WHERE id = $1`, [id]);
    if (check.rows.length === 0) throw new Error(`Subscription ${id} not found`);

    await client.query(
      `UPDATE subscription SET subscription_date = $1, member_id = $2, status = $3 WHERE id = $4`,
      [subscription_date, member_id, status, id]
    );

    await client.query(`DELETE FROM subscription_line_item WHERE subscription_id = $1`, [id]);

    for (let i = 0; i < line_items.length; i++) {
      const { package_id, start_date, end_date, base_price, discount_pct = 0 } = line_items[i];
      const extended_price = parseFloat(base_price) * (1 - parseFloat(discount_pct) / 100);

      await client.query(
        `INSERT INTO subscription_line_item
           (subscription_id, line_no, package_id, start_date, end_date, base_price, discount_pct, extended_price)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [id, i + 1, package_id, start_date, end_date, base_price, discount_pct, extended_price]
      );
    }

    await recalcTotal(client, id);
    await client.query('COMMIT');
    return await getSubscriptionById(id);
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

async function deleteSubscription(id) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(`DELETE FROM subscription_line_item WHERE subscription_id = $1`, [id]);
    const result = await client.query(
      `DELETE FROM subscription WHERE id = $1 RETURNING id`, [id]
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

async function getAllPackages() {
  const result = await pool.query(
    `SELECT id, package_name, duration_months, base_price, description
     FROM package
     ORDER BY package_name`
  );
  return result.rows;
}

module.exports = {
  getAllSubscriptions,
  getSubscriptionById,
  createSubscription,
  updateSubscription,
  deleteSubscription,
  getAllPackages,
};