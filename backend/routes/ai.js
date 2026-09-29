const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const { authenticateToken, requireStudent } = require('../middleware/auth');

router.post('/chat', authenticateToken, requireStudent, aiController.chatWithAI);

module.exports = router;
