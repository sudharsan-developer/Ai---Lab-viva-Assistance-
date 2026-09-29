const express = require('express');
const router = express.Router();
const vivaController = require('../controllers/vivaController');
const aiController = require('../controllers/aiController');
const resultsController = require('../controllers/resultsController');
const { authenticateToken, requireStaff, requireStudent } = require('../middleware/auth');

router.use(authenticateToken);

// Staff routes
router.post('/schedule', requireStaff, vivaController.scheduleViva);
router.patch('/schedule/:id/status', requireStaff, vivaController.updateScheduleStatus);
router.delete('/schedule/:id', requireStaff, vivaController.deleteSchedule);

// Shared route
router.get('/schedules', vivaController.getSchedules);

// Student routes
router.post('/start/:scheduleId', requireStudent, aiController.generateMCQs);
router.post('/submit/:scheduleId', requireStudent, resultsController.submitViva);

module.exports = router;
