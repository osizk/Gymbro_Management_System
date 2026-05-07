const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/expenseVoucherController');

// ─── Lookup routes ───────────────────────────────────────────────────────────
// GET /api/expenses/categories
router.get('/categories', ctrl.getAllExpenseCategories);

// GET /api/expenses/staff
router.get('/staff', ctrl.getAllStaff);

// GET /api/expenses/payment-methods
router.get('/payment-methods', ctrl.getAllPaymentMethods);

// ─── Voucher CRUD ────────────────────────────────────────────────────────────
// GET    /api/expenses/vouchers
router.get('/vouchers', ctrl.getAllVouchers);

// GET    /api/expenses/vouchers/:id
router.get('/vouchers/:id', ctrl.getVoucherById);

// POST   /api/expenses/vouchers
router.post('/vouchers', ctrl.createVoucher);

// PUT    /api/expenses/vouchers/:id
router.put('/vouchers/:id', ctrl.updateVoucher);

// DELETE /api/expenses/vouchers/:id
router.delete('/vouchers/:id', ctrl.deleteVoucher);

module.exports = router;
