/**
 * ragService.js
 *
 * Implements a lightweight Retrieval-Augmented Generation (RAG) layer.
 * Loads the stadium knowledge base (markdown files) into memory once at
 * startup, then scores and retrieves the most relevant documents for a
 * given fan question using weighted keyword matching with synonym
 * expansion. Kept deliberately simple (no vector embeddings) since the
 * knowledge base is small enough that this remains fast and accurate.
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../../../rag/data');

/**
 * Loads all markdown knowledge base documents from the rag/data directory
 * into memory. Runs once at module load time so retrieval never touches
 * the filesystem on a per-request basis.
 *
 * @returns {Array<{source: string, content: string}>} Array of document
 *          objects, each with the source filename and its raw content
 */
function loadDocuments() {
  const files = fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.md'));
  return files.map(file => ({
    source: file,
    content: fs.readFileSync(path.join(DATA_DIR, file), 'utf-8'),
  }));
}

const documents = loadDocuments();

/**
 * Manual synonym map used to expand a query so that lexically different
 * but semantically equivalent terms (e.g. "bathroom" vs "restroom") still
 * match relevant knowledge-base content.
 */
const synonyms = {
  bathroom: ['restroom', 'toilet'],
  restroom: ['bathroom', 'toilet'],
  parking: ['car park', 'lot'],
  metro: ['subway', 'train'],
};

/**
 * Expands a search query into a de-duplicated list of words, including
 * any synonym matches, so retrieval isn't limited to exact vocabulary.
 *
 * @param {string} query - The user's natural language question
 * @returns {string[]} Array of unique words including synonym expansions
 */
function expandQuery(query) {
  const words = query.toLowerCase().split(/\W+/).filter(Boolean);
  const expanded = new Set(words);
  words.forEach(w => {
    if (synonyms[w]) synonyms[w].forEach(s => expanded.add(s));
  });
  return Array.from(expanded);
}

/**
 * Scores a single document's relevance to a query. An exact phrase match
 * is weighted heavily (score +5) since it's the strongest relevance
 * signal; individual word/synonym overlaps each add +1.
 *
 * @param {string} query - The user's question
 * @param {string} docContent - The knowledge base document's raw content
 * @returns {number} Relevance score — higher means more relevant, 0 means no match
 */
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

/**
 * Retrieves the most relevant knowledge-base context for a given query.
 * Scores every loaded document, sorts by relevance, and returns the
 * top N matches formatted with source attribution — ready to be passed
 * directly into the LLM prompt.
 *
 * @param {string} query - The user's question
 * @param {number} [topN=2] - Maximum number of top-scoring documents to include
 * @returns {string} Concatenated context from the top matching documents,
 *                    prefixed with their source filenames, or an empty
 *                    string if nothing in the knowledge base matched
 */
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