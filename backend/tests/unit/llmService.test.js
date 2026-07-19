jest.mock('@google/generative-ai', () => {
  return {
    GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
      getGenerativeModel: jest.fn().mockReturnValue({
        generateContent: jest.fn().mockResolvedValue({
          response: { text: () => 'Mocked LLM response text.' }
        })
      })
    }))
  };
});

const { generateAnswer } = require('../../src/services/llmService');

describe('llmService generateAnswer (mocked SDK)', () => {
  test('returns text from the model response', async () => {
    const result = await generateAnswer('test question', 'some context');
    expect(result).toBe('Mocked LLM response text.');
  });

  test('handles empty context gracefully', async () => {
    const result = await generateAnswer('test question', '');
    expect(typeof result).toBe('string');
  });
});