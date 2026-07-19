/**
 * llmService.js
 *
 * Handles all communication with Google's Gemini API. Takes a user's
 * question plus retrieved knowledge-base context and generates a
 * grounded, natural-language response. Kept isolated from the controller
 * so the LLM provider could be swapped without touching request handling.
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');
const env = require('../config/env');

const genAI = new GoogleGenerativeAI(env.LLM_API_KEY);

/**
 * Generates a grounded answer to a fan's question using the Gemini API.
 *
 * Builds a system-style prompt instructing the model to answer strictly
 * from the provided context, admit when it doesn't know something rather
 * than hallucinate, and reply in the same language the user asked in.
 * Wrapped in a 15-second timeout so a slow or hung API call fails fast
 * instead of blocking the request indefinitely.
 *
 * @param {string} userQuery - The fan's question, already validated and sanitized
 * @param {string} contextText - Retrieved knowledge-base context from ragService,
 *                                or an empty string if no relevant context was found
 * @returns {Promise<string>} The model's generated answer text
 * @throws {Error} If the Gemini API call fails or exceeds the timeout
 */
async function generateAnswer(userQuery, contextText) {
  const model = genAI.getGenerativeModel({ model: env.LLM_MODEL });

  const prompt = `You are a helpful FIFA World Cup 2026 stadium concierge assistant.
Answer the fan's question using ONLY the context provided below.
If the context doesn't contain the answer, say you don't have that information and suggest they ask a volunteer or check Guest Services.
Be concise, friendly, and reply in the same language the user asked in.

Context:
${contextText || 'No specific context found for this query.'}

Fan's question: ${userQuery}`;

  const result = await Promise.race([
    model.generateContent(prompt),
    new Promise((_, reject) => setTimeout(() => reject(new Error('LLM request timed out')), 15000))
  ]);

  return result.response.text();
}

module.exports = { generateAnswer };