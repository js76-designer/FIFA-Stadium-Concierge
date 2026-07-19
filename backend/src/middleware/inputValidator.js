function validateChatInput(req, res, next) {
  const { message } = req.body;

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'A "message" field of type string is required.' });
  }

  const trimmed = message.trim();

  if (trimmed.length === 0) {
    return res.status(400).json({ error: 'Message cannot be empty.' });
  }

  if (trimmed.length > 500) {
    return res.status(400).json({ error: 'Message is too long (max 500 characters).' });
  }

  // Sanitize: strip HTML tags, then decode/neutralize common HTML entities
  // that could otherwise be used to reconstruct markup after stripping.
  const sanitized = trimmed
    .replace(/<[^>]*>?/gm, '')
    .replace(/&lt;|&gt;|&#x?0*3[CcEe];?/gi, '');

  req.body.message = sanitized;

  next();
}

module.exports = { validateChatInput };