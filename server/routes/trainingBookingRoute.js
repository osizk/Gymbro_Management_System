const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/trainingBookingController');

router.get('/trainers',       ctrl.getAllTrainers);
router.get('/training-types', ctrl.getAllTrainingTypes);
router.get('/members',        ctrl.getAllMembers);

router.get('/',        ctrl.getAllBookings);
router.post('/',       ctrl.createBooking);
router.get('/:id',     ctrl.getBookingById);
router.put('/:id',     ctrl.updateBooking);
router.delete('/:id',  ctrl.deleteBooking);

module.exports = router;
