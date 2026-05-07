const pool = require('../db');

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function generateBookingId(client) {
  const year = new Date().getFullYear();
  const prefix = `BK-${year}-`;
  const result = await client.query(
    `SELECT id FROM training_booking WHERE id LIKE $1 ORDER BY id DESC LIMIT 1`,
    [`${prefix}%`]
  );
  let nextNum = 1;
  if (result.rows.length > 0) {
    const lastNum = parseInt(result.rows[0].id.split('-')[2], 10);
    nextNum = lastNum + 1;
  }
  return `${prefix}${String(nextNum).padStart(6, '0')}`;
}

async function recalcTotal(client, bookingId) {
  await client.query(
    `UPDATE training_booking
     SET total_session_cost = (
       SELECT COALESCE(SUM(session_cost), 0)
       FROM training_session
       WHERE booking_id = $1
     )
     WHERE id = $1`,
    [bookingId]
  );
}

// TIME strings like "09:30" or "09:30:00" → total minutes
function calcDuration(start, end) {
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  return (eh * 60 + em) - (sh * 60 + sm);
}

// ─── CRUD ─────────────────────────────────────────────────────────────────────

async function getAllBookings() {
  const result = await pool.query(
    `SELECT
       tb.id,
       tb.booking_date,
       tb.member_id,
       m.member_name,
       tb.trainer_id,
       t.trainer_name,
       tb.total_session_cost,
       tb.created_at
     FROM training_booking tb
     LEFT JOIN member m  ON m.id  = tb.member_id
     LEFT JOIN trainer t ON t.id  = tb.trainer_id
     ORDER BY tb.created_at DESC`
  );
  return result.rows;
}

async function getBookingById(id) {
  const hdr = await pool.query(
    `SELECT
       tb.id,
       tb.booking_date,
       tb.member_id,
       m.member_name,
       tb.trainer_id,
       t.trainer_name,
       tb.total_session_cost,
       tb.created_at
     FROM training_booking tb
     LEFT JOIN member m  ON m.id  = tb.member_id
     LEFT JOIN trainer t ON t.id  = tb.trainer_id
     WHERE tb.id = $1`,
    [id]
  );
  if (hdr.rows.length === 0) return null;

  const lines = await pool.query(
    `SELECT
       ts.id,
       ts.booking_id,
       ts.line_no,
       ts.type_id,
       tt.type_name,
       ts.session_date,
       ts.start_time,
       ts.end_time,
       ts.duration_minutes,
       ts.hourly_rate,
       ts.session_cost,
       ts.notes
     FROM training_session ts
     JOIN training_type tt ON tt.id = ts.type_id
     WHERE ts.booking_id = $1
     ORDER BY ts.line_no`,
    [id]
  );

  return { ...hdr.rows[0], line_items: lines.rows };
}

async function createBooking(data) {
  const { booking_date, member_id, trainer_id, line_items } = data;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const bookingId = await generateBookingId(client);

    await client.query(
      `INSERT INTO training_booking (id, booking_date, member_id, trainer_id, total_session_cost)
       VALUES ($1, $2, $3, $4, 0)`,
      [bookingId, booking_date, member_id, trainer_id]
    );

    for (let i = 0; i < line_items.length; i++) {
      const { type_id, session_date, start_time, end_time, hourly_rate, notes } = line_items[i];
      const duration_minutes = calcDuration(start_time, end_time);
      const session_cost = (duration_minutes / 60) * parseFloat(hourly_rate);

      await client.query(
        `INSERT INTO training_session
           (booking_id, line_no, type_id, session_date, start_time, end_time, duration_minutes, hourly_rate, session_cost, notes)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [bookingId, i + 1, type_id, session_date, start_time, end_time, duration_minutes, hourly_rate, session_cost, notes || null]
      );
    }

    await recalcTotal(client, bookingId);
    await client.query('COMMIT');
    return await getBookingById(bookingId);
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

async function updateBooking(id, data) {
  const { booking_date, member_id, trainer_id, line_items } = data;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const check = await client.query(`SELECT id FROM training_booking WHERE id = $1`, [id]);
    if (check.rows.length === 0) throw new Error(`Booking ${id} not found`);

    await client.query(
      `UPDATE training_booking SET booking_date = $1, member_id = $2, trainer_id = $3 WHERE id = $4`,
      [booking_date, member_id, trainer_id, id]
    );

    await client.query(`DELETE FROM training_session WHERE booking_id = $1`, [id]);

    for (let i = 0; i < line_items.length; i++) {
      const { type_id, session_date, start_time, end_time, hourly_rate, notes } = line_items[i];
      const duration_minutes = calcDuration(start_time, end_time);
      const session_cost = (duration_minutes / 60) * parseFloat(hourly_rate);

      await client.query(
        `INSERT INTO training_session
           (booking_id, line_no, type_id, session_date, start_time, end_time, duration_minutes, hourly_rate, session_cost, notes)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [id, i + 1, type_id, session_date, start_time, end_time, duration_minutes, hourly_rate, session_cost, notes || null]
      );
    }

    await recalcTotal(client, id);
    await client.query('COMMIT');
    return await getBookingById(id);
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

async function deleteBooking(id) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(`DELETE FROM training_session WHERE booking_id = $1`, [id]);
    const result = await client.query(
      `DELETE FROM training_booking WHERE id = $1 RETURNING id`, [id]
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

async function getAllTrainers() {
  const result = await pool.query(
    `SELECT id, trainer_name, specialization, phone FROM trainer ORDER BY trainer_name`
  );
  return result.rows;
}

async function getAllTrainingTypes() {
  const result = await pool.query(
    `SELECT id, type_name, default_hourly_rate FROM training_type ORDER BY type_name`
  );
  return result.rows;
}

async function getAllMembers() {
  const result = await pool.query(
    `SELECT id, member_name, phone FROM member WHERE status = 'ACTIVE' ORDER BY member_name`
  );
  return result.rows;
}

module.exports = {
  getAllBookings,
  getBookingById,
  createBooking,
  updateBooking,
  deleteBooking,
  getAllTrainers,
  getAllTrainingTypes,
  getAllMembers,
};
