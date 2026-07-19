const fs = require('fs');
const path = require('path');


const DATA_DIR = path.join(__dirname, '../../../rag/data');

// Load all knowledge base docs into memory once at startup
function loadDocuments() {
  const files = fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.md'));
  return files.map(file => ({
    source: file,
    content: fs.readFileSync(path.join(DATA_DIR, file), 'utf-8'),
  }));
}

const documents = loadDocuments();

const synonyms = {
  bathroom: ['restroom', 'toilet'],
  restroom: ['bathroom', 'toilet'],
  parking: ['car park', 'lot'],
  metro: ['subway', 'train'],
};

function expandQuery(query) {
  const words = query.toLowerCase().split(/\W+/).filter(Boolean);
  const expanded = new Set(words);
  words.forEach(w => {
    if (synonyms[w]) synonyms[w].forEach(s => expanded.add(s));
  });
  return Array.from(expanded);
}

function scoreDocument(query, docContent) {
  const contentLower = docContent.toLowerCase();
  const queryLower = query.toLowerCase();
  let score = 0;

  // Exact phrase match — strong signal
  if (contentLower.includes(queryLower)) score += 5;

  // Expanded keyword overlap (includes synonyms)
  const queryWords = expandQuery(query);
  for (const word of queryWords) {
    if (contentLower.includes(word)) score += 1;
  }
  return score;
}

function retrieveContext(query, topN = 2) {
  const scored = documents.map(doc => ({
    ...doc,
    score: scoreDocument(query, doc.content),
  }));
  scored.sort((a, b) => b.score - a.score);
  const top = scored.filter(d => d.score > 0).slice(0, topN);

  if (top.length === 0) return '';
  return top.map(d => `[Source: ${d.source}]\n${d.content}`).join('\n\n');
}

module.exports = { retrieveContext, documents };