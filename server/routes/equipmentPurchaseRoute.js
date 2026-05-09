const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/equipmentPurchaseController');

router.get('/staff',                ctrl.getAllStaff);
router.get('/payment-methods',      ctrl.getAllPaymentMethods);
router.get('/equipment-categories', ctrl.getAllEquipmentCategories);

router.get('/',        ctrl.getAllPurchases);
router.post('/',       ctrl.createPurchase);
router.get('/:id',     ctrl.getPurchaseById);
router.put('/:id',     ctrl.updatePurchase);
router.delete('/:id',  ctrl.deletePurchase);

module.exports = router;
