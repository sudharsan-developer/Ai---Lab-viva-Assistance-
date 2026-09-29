const express = require('express');
const router = express.Router();
const resultsController = require('../controllers/resultsController');
const { authenticateToken, requireStudent, requireStaff } = require('../middleware/auth');

router.use(authenticateToken);

router.get('/student', requireStudent, resultsController.getStudentResults);
router.get('/staff', requireStaff, resultsController.getStaffResults);
router.get('/:id', resultsController.getResultDetail);

module.exports = router;
