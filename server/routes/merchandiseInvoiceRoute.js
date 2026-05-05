const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/merchandiseInvoiceController');

// ─── Lookup routes (used by frontend LOVs) ───────────────────────────────────
// GET /api/merchandise/products/active
router.get('/products/active', ctrl.getActiveProducts);

// GET /api/merchandise/members/:id
router.get('/members/:id', ctrl.getMemberById);

// ─── Invoice CRUD ────────────────────────────────────────────────────────────
// GET    /api/merchandise/invoices
router.get('/invoices', ctrl.getAllInvoices);

// GET    /api/merchandise/invoices/:id
router.get('/invoices/:id', ctrl.getInvoiceById);

// POST   /api/merchandise/invoices
router.post('/invoices', ctrl.createInvoice);

// PUT    /api/merchandise/invoices/:id
router.put('/invoices/:id', ctrl.updateInvoice);

// DELETE /api/merchandise/invoices/:id
router.delete('/invoices/:id', ctrl.deleteInvoice);

module.exports = router;