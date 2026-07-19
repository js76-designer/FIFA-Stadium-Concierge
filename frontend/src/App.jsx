import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const API_URL = 'http://localhost:5000/api/chat';
const STORAGE_KEY = 'stadium-concierge-chat-history';

const defaultMessages = [
  { role: 'assistant', text: "Hi! I'm your FIFA World Cup 2026 stadium concierge. Ask me about gates, accessibility, transport, or anything else about your matchday." }
];

const suggestedQuestions = [
  "How do I get to Gate B?",
  "Where's the nearest accessible restroom?",
  "How do I reach the stadium by metro?",
  "Where can I park my car?",
  "Is there a shuttle bus service?",
  "Where are the first aid stations?",
];

function loadStoredMessages() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // corrupted storage — fall back to default
  }
  return defaultMessages;
}

function App() {
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState(loadStoredMessages);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch {
      // storage full or unavailable — fail silently
    }
  }, [messages]);

  const sendMessage = async (overrideText) => {
    const trimmed = (overrideText ?? input).trim();
    if (!trimmed || loading) return;

    const userMessage = { role: 'user', text: trimmed };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const res = await axios.post(API_URL, { message: trimmed });
      setMessages(prev => [...prev, { role: 'assistant', text: res.data.answer }]);
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Something went wrong. Please try again.';
      setMessages(prev => [...prev, { role: 'assistant', text: errorMsg, isError: true }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionClick = (question) => {
    setInput(question);
    inputRef.current?.focus();
  };

  const clearHistory = () => {
    setMessages(defaultMessages);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!showChat) {
    return (
      <div className={`landing ${highContrast ? 'high-contrast' : ''}`}>
        <div className="pitch-lines" aria-hidden="true"></div>
        <button
          className="a11y-toggle landing-a11y"
          onClick={() => setHighContrast(!highContrast)}
          aria-pressed={highContrast}
          aria-label="Toggle high contrast mode"
        >
          {highContrast ? '☀️ Normal Mode' : '🌙 High Contrast'}
        </button>

        <div className="landing-content">
          <div className="landing-icon">⚽🏟️</div>
          <h1>Stadium Concierge</h1>
          <p className="landing-subtitle">
            Your AI-powered guide for FIFA World Cup 2026 — navigation, accessibility,
            and transportation, all in one conversation.
          </p>

          <div className="landing-features">
            <div className="feature-card">
              <span className="feature-icon">🧭</span>
              <h3>Navigation</h3>
              <p>Find gates, sections, and facilities instantly</p>
            </div>
            <div className="feature-card">
              <span className="feature-icon">♿</span>
              <h3>Accessibility</h3>
              <p>Wheelchair access, ramps, and assistance info</p>
            </div>
            <div className="feature-card">
              <span className="feature-icon">🚌</span>
              <h3>Transportation</h3>
              <p>Metro, shuttle, and parking guidance</p>
            </div>
            <div className="feature-card">
              <span className="feature-icon">🌐</span>
              <h3>Multilingual</h3>
              <p>Ask in any language, get answers in kind</p>
            </div>
          </div>

          <button className="start-chat-btn" onClick={() => setShowChat(true)}>
            Start Conversation →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`app-shell ${highContrast ? 'high-contrast' : ''}`}>
      <a href="#chat-input" className="skip-link">Skip to message input</a>

      <header className="app-header">
        <button className="back-btn" onClick={() => setShowChat(false)} aria-label="Back to home">
          ← Home
        </button>
        <h1>🏟️ Stadium Concierge</h1>
        <div className="header-actions">
          <button className="a11y-toggle" onClick={clearHistory} aria-label="Clear chat history">
            🗑️ Clear
          </button>
          <button
            className="a11y-toggle"
            onClick={() => setHighContrast(!highContrast)}
            aria-pressed={highContrast}
            aria-label="Toggle high contrast mode"
          >
            {highContrast ? '☀️ Normal Mode' : '🌙 High Contrast'}
          </button>
        </div>
      </header>

      <div className="app-body">
        <aside className="sidebar">
          <h2 className="sidebar-title">Quick Questions</h2>
          <div className="suggestion-list">
            {suggestedQuestions.map((q, i) => (
              <button
                key={i}
                className="suggestion-chip"
                onClick={() => handleSuggestionClick(q)}
              >
                {q}
              </button>
            ))}
          </div>
          <div className="sidebar-footer">
            <p>🌍 Ask in any language</p>
            <p>⚡ Powered by Gemini AI</p>
          </div>
        </aside>

        <main className="chat-window" role="log" aria-live="polite" aria-label="Chat messages">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`message ${msg.role} ${msg.isError ? 'error' : ''}`}
              role={msg.role === 'assistant' ? 'status' : undefined}
            >
              <span className="message-label">{msg.role === 'user' ? 'You' : 'Concierge'}</span>
              <p>{msg.text}</p>
            </div>
          ))}
          {loading && (
            <div className="message assistant" aria-live="polite">
              <span className="message-label">Concierge</span>
              <p className="typing">Thinking…</p>
            </div>
          )}
          <div ref={messagesEndRef} />

          <div className="chat-input-bar">
            <label htmlFor="chat-input" className="sr-only">Type your question</label>
            <textarea
              id="chat-input"
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about gates, accessibility, transport..."
              rows={1}
              aria-label="Type your question"
            />
            <button onClick={() => sendMessage()} disabled={loading || !input.trim()} aria-label="Send message">
              Send
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;