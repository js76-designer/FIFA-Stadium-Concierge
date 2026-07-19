const { validateChatInput } = require('../../src/middleware/inputValidator');

function mockReqRes(body) {
  const req = { body };
  const res = {
    statusCode: null,
    jsonBody: null,
    status(code) { this.statusCode = code; return this; },
    json(payload) { this.jsonBody = payload; return this; },
  };
  const next = jest.fn();
  return { req, res, next };
}

describe('validateChatInput middleware', () => {
  test('rejects missing message', () => {
    const { req, res, next } = mockReqRes({});
    validateChatInput(req, res, next);
    expect(res.statusCode).toBe(400);
    expect(next).not.toHaveBeenCalled();
  });

  test('rejects empty message', () => {
    const { req, res, next } = mockReqRes({ message: '   ' });
    validateChatInput(req, res, next);
    expect(res.statusCode).toBe(400);
  });

  test('rejects message over 500 characters', () => {
    const { req, res, next } = mockReqRes({ message: 'a'.repeat(501) });
    validateChatInput(req, res, next);
    expect(res.statusCode).toBe(400);
  });

  test('allows a valid message and strips HTML tags', () => {
    const { req, res, next } = mockReqRes({ message: '<script>hi</script> where is gate B' });
    validateChatInput(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(req.body.message).toBe('hi where is gate B');
  });
});