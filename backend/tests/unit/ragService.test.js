const { retrieveContext } = require('../../src/services/ragService');

describe('ragService retrieveContext', () => {
  test('returns relevant context for a known keyword', () => {
    const result = retrieveContext('how do I get to gate B');
    expect(result).toContain('Gate B');
  });

  test('returns relevant context for accessibility keywords', () => {
    const result = retrieveContext('wheelchair accessible restroom');
    expect(result.toLowerCase()).toContain('accessible');
  });

  test('returns empty string for a query with no matching keywords', () => {
    const result = retrieveContext('xyzzy nonsense query qwerty');
    expect(result).toBe('');
  });

  test('includes source attribution in retrieved context', () => {
    const result = retrieveContext('metro shuttle bus');
    expect(result).toMatch(/\[Source: .*\.md\]/);
  });
});