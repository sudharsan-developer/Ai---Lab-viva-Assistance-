const express = require('express');
const router  = express.Router();
const { authenticateToken, requireStaff } = require('../middleware/auth');
const { getExperiments, createExperiment, deleteExperiment } = require('../controllers/labController');

router.get   ('/',    authenticateToken, requireStaff, getExperiments);
router.post  ('/',    authenticateToken, requireStaff, createExperiment);
router.delete('/:id', authenticateToken, requireStaff, deleteExperiment);

module.exports = router;
