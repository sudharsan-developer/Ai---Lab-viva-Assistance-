const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const { authenticateToken, requireStudent } = require('../middleware/auth');

router.use(authenticateToken);
router.use(requireStudent);

router.get('/dashboard', studentController.getDashboard);
router.get('/profile', studentController.getProfile);

module.exports = router;
