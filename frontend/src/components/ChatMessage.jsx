function ChatMessage({ role, text, isError }) {
  return (
    <div
      className={`message ${role} ${isError ? 'error' : ''}`}
      role={role === 'assistant' ? 'status' : undefined}
    >
      <span className="message-label">{role === 'user' ? 'You' : 'Concierge'}</span>
      <p>{text}</p>
    </div>
  );
}

export default ChatMessage;