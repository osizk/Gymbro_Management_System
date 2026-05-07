const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/subscriptionController');

// GET /api/subscriptions/packages
router.get('/packages', ctrl.getAllPackages);

// GET    /api/subscriptions
router.get('/',        ctrl.getAllSubscriptions);
// GET    /api/subscriptions/:id
router.get('/:id',     ctrl.getSubscriptionById);
// POST   /api/subscriptions
router.post('/',       ctrl.createSubscription);
// PUT    /api/subscriptions/:id
router.put('/:id',     ctrl.updateSubscription);
// DELETE /api/subscriptions/:id
router.delete('/:id',  ctrl.deleteSubscription);

module.exports = router;