const { retrieveContext } = require('../services/ragService');
const { generateAnswer } = require('../services/llmService');

// Simple in-memory cache: avoids repeat LLM calls for identical questions
const cache = new Map();

async function handleChat(req, res) {
  try {
    const { message } = req.body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({ error: 'A non-empty "message" field is required.' });
    }

    const cacheKey = message.trim().toLowerCase();

    if (cache.has(cacheKey)) {
      return res.status(200).json({ answer: cache.get(cacheKey), cached: true });
    }

    const context = retrieveContext(message);
    const answer = await generateAnswer(message, context);

    cache.set(cacheKey, answer);

    res.status(200).json({ answer });
  } catch (err) {
    console.error('Chat error:', err.message);
    res.status(500).json({ error: 'Something went wrong generating a response.' });
  }
}

module.exports = { handleChat };