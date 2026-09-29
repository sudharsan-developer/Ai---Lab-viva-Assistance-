const express = require('express');
const router = express.Router();
const staffController = require('../controllers/staffController');
const { authenticateToken, requireStaff } = require('../middleware/auth');

router.use(authenticateToken);
router.use(requireStaff);

router.get('/dashboard', staffController.getDashboard);
router.get('/students', staffController.getAllStudents);
router.get('/subject', staffController.getSubject);

module.exports = router;
