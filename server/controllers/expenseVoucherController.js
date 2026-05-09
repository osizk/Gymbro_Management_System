const service = require('../services/expenseVoucherService');

// ─── Voucher CRUD ────────────────────────────────────────────────────────────

async function getAllVouchers(req, res) {
  try {
    const data = await service.getAllVouchers();
    res.json({ success: true, data });
  } catch (err) {
    console.error('[getAllVouchers]', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
}

async function getVoucherById(req, res) {
  try {
    const data = await service.getVoucherById(req.params.id);
    if (!data) return res.status(404).json({ success: false, message: 'Voucher not found' });
    res.json({ success: true, data });
  } catch (err) {
    console.error('[getVoucherById]', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
}

async function createVoucher(req, res) {
  try {
    const { voucher_date, vendor_name, paid_by_staff_id, method_id, line_items } = req.body;

    if (!voucher_date)      return res.status(400).json({ success: false, message: 'voucher_date is required' });
    if (!vendor_name)       return res.status(400).json({ success: false, message: 'vendor_name is required' });
    if (!paid_by_staff_id)  return res.status(400).json({ success: false, message: 'paid_by_staff_id is required' });
    if (!method_id)         return res.status(400).json({ success: false, message: 'method_id is required' });
    if (!Array.isArray(line_items) || line_items.length === 0)
      return res.status(400).json({ success: false, message: 'At least one line item is required' });

    const data = await service.createVoucher({ voucher_date, vendor_name, paid_by_staff_id, method_id, line_items });
    res.status(201).json({ success: true, data });
  } catch (err) {
    console.error('[createVoucher]', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
}

async function updateVoucher(req, res) {
  try {
    const { voucher_date, vendor_name, paid_by_staff_id, method_id, line_items } = req.body;

    if (!voucher_date)      return res.status(400).json({ success: false, message: 'voucher_date is required' });
    if (!vendor_name)       return res.status(400).json({ success: false, message: 'vendor_name is required' });
    if (!paid_by_staff_id)  return res.status(400).json({ success: false, message: 'paid_by_staff_id is required' });
    if (!method_id)         return res.status(400).json({ success: false, message: 'method_id is required' });
    if (!Array.isArray(line_items) || line_items.length === 0)
      return res.status(400).json({ success: false, message: 'At least one line item is required' });

    const data = await service.updateVoucher(req.params.id, { voucher_date, vendor_name, paid_by_staff_id, method_id, line_items });
    res.json({ success: true, data });
  } catch (err) {
    console.error('[updateVoucher]', err.message);
    if (err.message.includes('not found')) return res.status(404).json({ success: false, message: err.message });
    res.status(500).json({ success: false, message: err.message });
  }
}

async function deleteVoucher(req, res) {
  try {
    const deleted = await service.deleteVoucher(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Voucher not found' });
    res.json({ success: true, message: 'Voucher deleted successfully' });
  } catch (err) {
    console.error('[deleteVoucher]', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
}

// ─── Lookup Endpoints ────────────────────────────────────────────────────────

async function getAllExpenseCategories(req, res) {
  try {
    const data = await service.getAllExpenseCategories();
    res.json({ success: true, data });
  } catch (err) {
    console.error('[getAllExpenseCategories]', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
}

async function getAllStaff(req, res) {
  try {
    const data = await service.getAllStaff();
    res.json({ success: true, data });
  } catch (err) {
    console.error('[getAllStaff]', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
}

async function getAllPaymentMethods(req, res) {
  try {
    const data = await service.getAllPaymentMethods();
    res.json({ success: true, data });
  } catch (err) {
    console.error('[getAllPaymentMethods]', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
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
