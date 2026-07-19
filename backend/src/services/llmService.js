const { GoogleGenerativeAI } = require('@google/generative-ai');
const env = require('../config/env');

const genAI = new GoogleGenerativeAI(env.LLM_API_KEY);

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