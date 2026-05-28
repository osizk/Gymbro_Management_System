const router = require('express').Router();
const ctrl = require('../controllers/reportController');

router.get('/', ctrl.getReportGroups);
router.get('/:reportId', ctrl.getReportById);

module.exports = router;
