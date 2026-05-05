const service = require('../services/merchandiseInvoiceService');

// ─── Invoice CRUD ────────────────────────────────────────────────────────────

async function getAllInvoices(req, res) {
  try {
    const data = await service.getAllInvoices();
    res.json({ success: true, data });
  } catch (err) {
    console.error('[getAllInvoices]', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
}

async function getInvoiceById(req, res) {
  try {
    const data = await service.getInvoiceById(req.params.id);
    if (!data) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }
    res.json({ success: true, data });
  } catch (err) {
    console.error('[getInvoiceById]', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
}

async function createInvoice(req, res) {
  try {
    const { invoice_date, member_id, line_items } = req.body;

    if (!invoice_date) {
      return res.status(400).json({ success: false, message: 'invoice_date is required' });
    }
    if (!Array.isArray(line_items) || line_items.length === 0) {
      return res.status(400).json({ success: false, message: 'At least one line item is required' });
    }

    const data = await service.createInvoice({ invoice_date, member_id, line_items });
    res.status(201).json({ success: true, data });
  } catch (err) {
    console.error('[createInvoice]', err.message);
    const status = err.message.includes('Insufficient stock') ? 422 : 500;
    res.status(status).json({ success: false, message: err.message });
  }
}

async function updateInvoice(req, res) {
  try {
    const { invoice_date, member_id, line_items } = req.body;

    if (!invoice_date) {
      return res.status(400).json({ success: false, message: 'invoice_date is required' });
    }
    if (!Array.isArray(line_items) || line_items.length === 0) {
      return res.status(400).json({ success: false, message: 'At least one line item is required' });
    }

    const data = await service.updateInvoice(req.params.id, { invoice_date, member_id, line_items });
    res.json({ success: true, data });
  } catch (err) {
    console.error('[updateInvoice]', err.message);
    if (err.message.includes('not found')) {
      return res.status(404).json({ success: false, message: err.message });
    }
    const status = err.message.includes('Insufficient stock') ? 422 : 500;
    res.status(status).json({ success: false, message: err.message });
  }
}

async function deleteInvoice(req, res) {
  try {
    const deleted = await service.deleteInvoice(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }
    res.json({ success: true, message: 'Invoice deleted successfully' });
  } catch (err) {
    console.error('[deleteInvoice]', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
}

// ─── Lookup Endpoints ────────────────────────────────────────────────────────

async function getActiveProducts(req, res) {
  try {
    const data = await service.getActiveProducts();
    res.json({ success: true, data });
  } catch (err) {
    console.error('[getActiveProducts]', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
}

async function getMemberById(req, res) {
  try {
    const data = await service.getMemberById(req.params.id);
    if (!data) {
      return res.status(404).json({ success: false, message: 'Member not found' });
    }
    res.json({ success: true, data });
  } catch (err) {
    console.error('[getMemberById]', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = {
  getAllInvoices,
  getInvoiceById,
  createInvoice,
  updateInvoice,
  deleteInvoice,
  getActiveProducts,
  getMemberById,
};