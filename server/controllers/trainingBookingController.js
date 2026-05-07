const service = require('../services/trainingBookingService');

async function getAllBookings(req, res) {
  try {
    const data = await service.getAllBookings();
    res.json({ success: true, data });
  } catch (err) {
    console.error('[getAllBookings]', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
}

async function getBookingById(req, res) {
  try {
    const data = await service.getBookingById(req.params.id);
    if (!data) return res.status(404).json({ success: false, message: 'Booking not found' });
    res.json({ success: true, data });
  } catch (err) {
    console.error('[getBookingById]', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
}

async function createBooking(req, res) {
  try {
    const { booking_date, member_id, trainer_id, line_items } = req.body;
    if (!booking_date)  return res.status(400).json({ success: false, message: 'booking_date is required' });
    if (!member_id)     return res.status(400).json({ success: false, message: 'member_id is required' });
    if (!trainer_id)    return res.status(400).json({ success: false, message: 'trainer_id is required' });
    if (!Array.isArray(line_items) || line_items.length === 0)
      return res.status(400).json({ success: false, message: 'At least one session is required' });

    const data = await service.createBooking({ booking_date, member_id, trainer_id, line_items });
    res.status(201).json({ success: true, data });
  } catch (err) {
    console.error('[createBooking]', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
}

async function updateBooking(req, res) {
  try {
    const { booking_date, member_id, trainer_id, line_items } = req.body;
    if (!booking_date)  return res.status(400).json({ success: false, message: 'booking_date is required' });
    if (!member_id)     return res.status(400).json({ success: false, message: 'member_id is required' });
    if (!trainer_id)    return res.status(400).json({ success: false, message: 'trainer_id is required' });
    if (!Array.isArray(line_items) || line_items.length === 0)
      return res.status(400).json({ success: false, message: 'At least one session is required' });

    const data = await service.updateBooking(req.params.id, { booking_date, member_id, trainer_id, line_items });
    res.json({ success: true, data });
  } catch (err) {
    console.error('[updateBooking]', err.message);
    if (err.message.includes('not found')) return res.status(404).json({ success: false, message: err.message });
    res.status(500).json({ success: false, message: err.message });
  }
}

async function deleteBooking(req, res) {
  try {
    const deleted = await service.deleteBooking(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Booking not found' });
    res.json({ success: true, message: 'Booking deleted successfully' });
  } catch (err) {
    console.error('[deleteBooking]', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
}

async function getAllTrainers(req, res) {
  try {
    const data = await service.getAllTrainers();
    res.json({ success: true, data });
  } catch (err) {
    console.error('[getAllTrainers]', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
}

async function getAllTrainingTypes(req, res) {
  try {
    const data = await service.getAllTrainingTypes();
    res.json({ success: true, data });
  } catch (err) {
    console.error('[getAllTrainingTypes]', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
}

async function getAllMembers(req, res) {
  try {
    const data = await service.getAllMembers();
    res.json({ success: true, data });
  } catch (err) {
    console.error('[getAllMembers]', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
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
