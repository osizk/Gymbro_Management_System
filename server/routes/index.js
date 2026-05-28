const express = require('express');
const router = express.Router();

// ─── Register module routes here ─────────────────────────────────────────────
// Each module has its own route file. To add a new module, just add one line.
// Example: router.use('/subscriptions', require('./subscriptionRoute'));

router.use('/merchandise',    require('./merchandiseInvoiceRoute'));
router.use('/subscriptions',  require('./subscriptionRoute'));
router.use('/expenses',          require('./expenseVoucherRoute'));
router.use('/training-bookings', require('./trainingBookingRoute'));
router.use('/payment-receipts',  require('./paymentReceiptRoute'));
router.use('/equipment',         require('./equipmentPurchaseRoute'));

// ─── Simple form routes ───────────────────────────────────────────────────────
router.use('/members',               require('./memberRoute'));
router.use('/trainers',              require('./trainerRoute'));
router.use('/staff',                 require('./staffRoute'));
router.use('/packages',              require('./packageRoute'));
router.use('/training-types',        require('./trainingTypeRoute'));
router.use('/classes',               require('./classRoute'));
router.use('/class-bookings',        require('./classBookingRoute'));
router.use('/products',              require('./productRoute'));
router.use('/equipment-items',       require('./equipmentItemRoute'));
router.use('/maintenance-tickets',   require('./maintenanceTicketRoute'));
router.use('/expense-categories',    require('./expenseCategoryRoute'));
router.use('/payment-methods',       require('./paymentMethodRoute'));
router.use('/equipment-categories',  require('./equipmentCategoryRoute'));
router.use('/product-categories',    require('./productCategoryRoute'));

// ─── Report routes ────────────────────────────────────────────────────────────
router.use('/reports', require('./reportRoute'));

module.exports = router;
