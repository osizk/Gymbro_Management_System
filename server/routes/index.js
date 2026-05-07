const express = require('express');
const router = express.Router();

// ─── Register module routes here ─────────────────────────────────────────────
// Each module has its own route file. To add a new module, just add one line.
// Example: router.use('/subscriptions', require('./subscriptionRoute'));

router.use('/merchandise',    require('./merchandiseInvoiceRoute'));
router.use('/subscriptions',  require('./subscriptionRoute'));
// router.use('/training-bookings', require('./trainingBookingRoute'));
// router.use('/payment-receipts',  require('./paymentReceiptRoute'));
// router.use('/expenses',          require('./expenseRoute'));
// router.use('/equipment',         require('./equipmentRoute'));

module.exports = router;