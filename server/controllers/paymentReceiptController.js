const service = require('../services/paymentReceiptService');

async function getAllReceipts(req, res) {
  try {
    const data = await service.getAllReceipts();
    res.json({ success: true, data });
  } catch (err) {
    console.error('[getAllReceipts]', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
}

async function getReceiptById(req, res) {
  try {
    const data = await service.getReceiptById(req.params.id);
    if (!data) return res.status(404).json({ success: false, message: 'Receipt not found' });
    res.json({ success: true, data });
  } catch (err) {
    console.error('[getReceiptById]', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
}

async function createReceipt(req, res) {
  try {
    const { receipt_date, member_id, method_id, payment_reference_no, line_items } = req.body;
    if (!receipt_date) return res.status(400).json({ success: false, message: 'receipt_date is required' });
    if (!member_id)    return res.status(400).json({ success: false, message: 'member_id is required' });
    if (!method_id)    return res.status(400).json({ success: false, message: 'method_id is required' });
    if (!Array.isArray(line_items) || line_items.length === 0)
      return res.status(400).json({ success: false, message: 'At least one line item is required' });

    const data = await service.createReceipt({ receipt_date, member_id, method_id, payment_reference_no, line_items });
    res.status(201).json({ success: true, data });
  } catch (err) {
    console.error('[createReceipt]', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
}

async function updateReceipt(req, res) {
  try {
    const { receipt_date, member_id, method_id, payment_reference_no, line_items } = req.body;
    if (!receipt_date) return res.status(400).json({ success: false, message: 'receipt_date is required' });
    if (!member_id)    return res.status(400).json({ success: false, message: 'member_id is required' });
    if (!method_id)    return res.status(400).json({ success: false, message: 'method_id is required' });
    if (!Array.isArray(line_items) || line_items.length === 0)
      return res.status(400).json({ success: false, message: 'At least one line item is required' });

    const data = await service.updateReceipt(req.params.id, { receipt_date, member_id, method_id, payment_reference_no, line_items });
    res.json({ success: true, data });
  } catch (err) {
    console.error('[updateReceipt]', err.message);
    if (err.message.includes('not found')) return res.status(404).json({ success: false, message: err.message });
    res.status(500).json({ success: false, message: err.message });
  }
}

async function deleteReceipt(req, res) {
  try {
    const deleted = await service.deleteReceipt(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Receipt not found' });
    res.json({ success: true, message: 'Receipt deleted successfully' });
  } catch (err) {
    console.error('[deleteReceipt]', err.message);
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
  getAllReceipts,
  getReceiptById,
  createReceipt,
  updateReceipt,
  deleteReceipt,
  getAllPaymentMethods,
};
