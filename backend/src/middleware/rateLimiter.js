const rateLimit = require('express-rate-limit');
const env = require('../config/env');

const chatRateLimiter = rateLimit({
  windowMs: Number(env.RATE_LIMIT_WINDOW_MS) || 60000,
  max: Number(env.RATE_LIMIT_MAX_REQUESTS) || 20,
  message: { error: 'Too many requests. Please wait a moment and try again.' },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { chatRateLimiter };