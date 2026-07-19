const express = require('express');
const router = express.Router();
const { handleChat } = require('../controllers/chatController');
const { validateChatInput } = require('../middleware/inputValidator');
const { chatRateLimiter } = require('../middleware/rateLimiter');

router.post('/', chatRateLimiter, validateChatInput, handleChat);

module.exports = router;