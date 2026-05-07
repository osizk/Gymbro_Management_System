const service = require('../services/equipmentPurchaseService');

async function getAllPurchases(req, res) {
  try {
    const data = await service.getAllPurchases();
    res.json({ success: true, data });
  } catch (err) {
    console.error('[getAllPurchases]', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
}

async function getPurchaseById(req, res) {
  try {
    const data = await service.getPurchaseById(req.params.id);
    if (!data) return res.status(404).json({ success: false, message: 'Purchase not found' });
    res.json({ success: true, data });
  } catch (err) {
    console.error('[getPurchaseById]', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
}

async function createPurchase(req, res) {
  try {
    const { purchase_date, supplier_name, received_by_staff_id, method_id, line_items } = req.body;
    if (!purchase_date)        return res.status(400).json({ success: false, message: 'purchase_date is required' });
    if (!supplier_name)        return res.status(400).json({ success: false, message: 'supplier_name is required' });
    if (!received_by_staff_id) return res.status(400).json({ success: false, message: 'received_by_staff_id is required' });
    if (!method_id)            return res.status(400).json({ success: false, message: 'method_id is required' });
    if (!Array.isArray(line_items) || line_items.length === 0)
      return res.status(400).json({ success: false, message: 'At least one item is required' });

    const data = await service.createPurchase({ purchase_date, supplier_name, received_by_staff_id, method_id, line_items });
    res.status(201).json({ success: true, data });
  } catch (err) {
    console.error('[createPurchase]', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
}

async function updatePurchase(req, res) {
  try {
    const { purchase_date, supplier_name, received_by_staff_id, method_id, line_items } = req.body;
    if (!purchase_date)        return res.status(400).json({ success: false, message: 'purchase_date is required' });
    if (!supplier_name)        return res.status(400).json({ success: false, message: 'supplier_name is required' });
    if (!received_by_staff_id) return res.status(400).json({ success: false, message: 'received_by_staff_id is required' });
    if (!method_id)            return res.status(400).json({ success: false, message: 'method_id is required' });
    if (!Array.isArray(line_items) || line_items.length === 0)
      return res.status(400).json({ success: false, message: 'At least one item is required' });

    const data = await service.updatePurchase(req.params.id, { purchase_date, supplier_name, received_by_staff_id, method_id, line_items });
    res.json({ success: true, data });
  } catch (err) {
    console.error('[updatePurchase]', err.message);
    if (err.message.includes('not found')) return res.status(404).json({ success: false, message: err.message });
    res.status(500).json({ success: false, message: err.message });
  }
}

async function deletePurchase(req, res) {
  try {
    const deleted = await service.deletePurchase(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Purchase not found' });
    res.json({ success: true, message: 'Purchase deleted successfully' });
  } catch (err) {
    console.error('[deletePurchase]', err.message);
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

async function getAllEquipmentCategories(req, res) {
  try {
    const data = await service.getAllEquipmentCategories();
    res.json({ success: true, data });
  } catch (err) {
    console.error('[getAllEquipmentCategories]', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
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
