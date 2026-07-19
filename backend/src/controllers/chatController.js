/**
 * chatController.js
 *
 * Orchestrates the full chat request lifecycle: validates via middleware
 * (upstream), checks an in-memory cache for repeat questions, retrieves
 * grounding context from the knowledge base, calls the LLM, and returns
 * a JSON response. Caching lives here rather than in the LLM service so
 * it stays a pure API-calling module, and here it can be swapped for a
 * persistent store (Redis, etc.) without touching the LLM logic.
 */
const { retrieveContext } = require('../services/ragService');
const { generateAnswer } = require('../services/llmService');

// Simple in-memory cache: avoids repeat LLM calls for identical questions
const cache = new Map();

/**
 * Express request handler for POST /api/chat.
 * @param {import('express').Request} req - Expects { message: string } in the body
 * @param {import('express').Response} res
 * @returns {Promise<void>} Sends a JSON response: { answer } on success,
 *          { error } with 400/500 status on validation or LLM failure
 */
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