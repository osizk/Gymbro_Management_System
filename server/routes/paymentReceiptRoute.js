const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/paymentReceiptController');

router.get('/payment-methods', ctrl.getAllPaymentMethods);

router.get('/',        ctrl.getAllReceipts);
router.post('/',       ctrl.createReceipt);
router.get('/:id',     ctrl.getReceiptById);
router.put('/:id',     ctrl.updateReceipt);
router.delete('/:id',  ctrl.deleteReceipt);

module.exports = router;
