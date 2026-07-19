function Header({ onBack, onClear, highContrast, onToggleContrast, showBackButton }) {
  return (
    <header className="app-header">
      {showBackButton && (
        <button className="back-btn" onClick={onBack} aria-label="Back to home">
          ← Home
        </button>
      )}
      <h1>🏟️ Stadium Concierge</h1>
      <div className="header-actions">
        {onClear && (
          <button className="a11y-toggle" onClick={onClear} aria-label="Clear chat history">
            🗑️ Clear
          </button>
        )}
        <button
          className="a11y-toggle"
          onClick={onToggleContrast}
          aria-pressed={highContrast}
          aria-label="Toggle high contrast mode"
        >
          {highContrast ? '☀️ Normal Mode' : '🌙 High Contrast'}
        </button>
      </div>
    </header>
  );
}

export default Header;