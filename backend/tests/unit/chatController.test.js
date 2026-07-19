jest.mock('../../src/services/ragService');
jest.mock('../../src/services/llmService');

const { retrieveContext } = require('../../src/services/ragService');
const { generateAnswer } = require('../../src/services/llmService');
const { handleChat } = require('../../src/controllers/chatController');

function mockRes() {
  return {
    statusCode: null,
    jsonBody: null,
    status(code) { this.statusCode = code; return this; },
    json(payload) { this.jsonBody = payload; return this; },
  };
}

describe('handleChat controller (mocked LLM)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('returns 200 with answer on valid message', async () => {
    retrieveContext.mockReturnValue('[Source: test.md]\nSome context.');
    generateAnswer.mockResolvedValue('Mocked concierge answer.');

    const req = { body: { message: 'how do I get to gate B' } };
    const res = mockRes();

    await handleChat(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.jsonBody.answer).toBe('Mocked concierge answer.');
    expect(retrieveContext).toHaveBeenCalledWith('how do I get to gate B');
    expect(generateAnswer).toHaveBeenCalled();
  });

  test('returns second identical request from cache without calling LLM again', async () => {
    retrieveContext.mockReturnValue('context');
    generateAnswer.mockResolvedValue('Cached answer.');

    const req = { body: { message: 'unique cache test question' } };
    await handleChat(req, mockRes());
    await handleChat(req, mockRes());

    expect(generateAnswer).toHaveBeenCalledTimes(1);
  });

  test('returns 400 for missing message', async () => {
    const req = { body: {} };
    const res = mockRes();
    await handleChat(req, res);
    expect(res.statusCode).toBe(400);
  });

  test('returns 500 if generateAnswer throws', async () => {
    retrieveContext.mockReturnValue('context');
    generateAnswer.mockRejectedValue(new Error('LLM failed'));

    const req = { body: { message: 'a question that will fail uniquely' } };
    const res = mockRes();
    await handleChat(req, res);

    expect(res.statusCode).toBe(500);
  });
});