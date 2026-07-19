function Sidebar({ questions, onSelect }) {
  return (
    <aside className="sidebar">
      <h2 className="sidebar-title">Quick Questions</h2>
      <div className="suggestion-list">
        {questions.map((q, i) => (
          <button key={i} className="suggestion-chip" onClick={() => onSelect(q)}>
            {q}
          </button>
        ))}
      </div>
      <div className="sidebar-footer">
        <p>🌍 Ask in any language</p>
        <p>⚡ Powered by Gemini AI</p>
      </div>
    </aside>
  );
}

export default Sidebar;