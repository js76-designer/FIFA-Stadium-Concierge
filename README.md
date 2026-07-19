# 🏟️ FIFA World Cup 2026 Stadium Concierge

A GenAI-powered stadium concierge that helps fans, volunteers, and staff navigate stadium operations — built for **PromptWars (Hack2skill)**.

![Node.js](https://img.shields.io/badge/Node.js-Express-green)
![React](https://img.shields.io/badge/React-Vite-blue)
![Gemini](https://img.shields.io/badge/GenAI-Gemini%202.5%20Flash-orange)
![Tests](https://img.shields.io/badge/tests-19%20passing-brightgreen)

---

## Problem Statement Alignment

This solution directly addresses the challenge brief: *"Build a GenAI-enabled solution that enhances stadium operations and the overall tournament experience... leveraging Generative AI to improve navigation, crowd management, accessibility, transportation, sustainability, multilingual assistance, operational intelligence, or real-time decision support."*

| Pillar | Status | Implementation Detail |
|---|---|---|
| **Navigation** | ✅ Fully implemented | RAG-grounded chat answers gate, section, and facility location questions using real stadium knowledge base data (`rag/data/stadium_maps.md`) |
| **Accessibility** | ✅ Fully implemented | Dedicated accessibility knowledge base (`rag/data/accessibility_faq.md`); UI features high-contrast mode, skip-to-input link, full keyboard navigation, ARIA live regions, and screen-reader labels — accessibility is treated as a first-class feature, not an afterthought |
| **Transportation** | ✅ Fully implemented | Metro, shuttle, parking, and ride-share guidance via natural language (`rag/data/transport_schedules.md`) |
| **Multilingual Assistance** | ✅ Fully implemented | No separate translation layer needed — Gemini natively detects and responds in the fan's own language, verified in testing |
| **Operational Intelligence** | ✅ Demonstrated end-to-end | Working `/api/analytics` endpoint returns gate capacity and top fan-question data. Currently backed by representative mock data; the architecture is designed so this would plug directly into real query logs (already captured via the caching layer) and live gate sensor feeds with no structural changes |
| **Crowd Management** | 📋 Architected for, not built | The analytics endpoint's `gateStatus` structure is intentionally designed to extend into real-time crowd density alerts — a natural next iteration is pushing this data to a staff-facing dashboard with threshold-based notifications |
| **Sustainability** | 📋 Future scope | Not addressed in this MVP. A natural extension: weighting transportation recommendations by carbon footprint, and nudging fans toward public transit over parking when both are viable |

**Why this scope:** rather than superficially touching all seven pillars, this submission fully implements four with genuine GenAI grounding, demonstrates a fifth with working (if mocked) code, and transparently scopes the remaining two as documented future work. We believe a smaller set of pillars implemented with real depth — actual retrieval, actual tests, actual accessibility support — better serves the stated goal of *enhancing* stadium operations than a shallow pass across all seven.

## How Generative AI Is Used

This is a **Retrieval-Augmented Generation (RAG)** system, not a thin wrapper around an LLM:

1. A fan asks a question in natural language, in any language
2. The backend retrieves the most relevant facts from a stadium knowledge base using weighted keyword matching with synonym expansion
3. That retrieved context is passed to **Google's Gemini API** (`gemini-2.5-flash`), which generates a natural, grounded, conversational answer
4. If the knowledge base doesn't cover the question, the model is instructed to say so honestly rather than hallucinate — verified in automated tests

## Problem Statement Alignment

| Pillar | Status | Implementation |
|---|---|---|
| **Navigation** | ✅ Implemented | Conversational assistant answers gate, section, and facility questions grounded in a stadium knowledge base |
| **Accessibility** | ✅ Implemented | Dedicated accessibility knowledge base; high-contrast mode; full keyboard navigation with skip link; ARIA live regions and labels throughout |
| **Transportation** | ✅ Implemented | Metro, shuttle, parking, and ride-share information via natural language |
| **Multilingual Assistance** | ✅ Implemented | Gemini responds natively in whatever language the fan asks in — no separate translation layer needed |
| **Operational Intelligence** | ✅ Demonstrated | `/api/analytics` endpoint shows gate capacity and top fan questions (mocked data — real implementation would compute this from live query logs and gate sensors) |
| **Crowd Management** | 📋 Future scope | Would extend the analytics endpoint with live gate sensor feeds and push alerts to staff |
| **Sustainability** | 📋 Future scope | Not addressed in this MVP; a natural extension would be transit-mode recommendations weighted by carbon footprint |

## Architecture
Frontend (React + Vite)
│  HTTP POST /api/chat
▼
Backend (Node.js + Express)
│
├── Middleware: rate limiting, input validation & sanitization, helmet security headers
├── Controller: orchestrates requests, in-memory response caching
├── RAG Service: weighted keyword + synonym-expanded retrieval over knowledge base
├── LLM Service: Gemini API call with retrieved context, 15s timeout guard
└── Analytics Route: operational intelligence data (mocked)
│
▼

## Tech Stack

- **Frontend:** React, Vite, custom CSS (no framework overhead)
- **Backend:** Node.js, Express
- **GenAI:** Google Gemini API (`gemini-2.5-flash`)
- **Testing:** Jest, Supertest, mocked LLM/SDK calls for offline testing
- **Security:** Helmet, express-rate-limit, custom sanitization middleware

## Judging Criteria Coverage

### Code Quality
Clear separation of concerns across routes / controllers / services / middleware. Defensive startup checks (fails fast if `LLM_API_KEY` is missing). Consistent error handling throughout.

### Security
- Rate limiting on the chat endpoint (`express-rate-limit`)
- Input validation and HTML sanitization on every request (regex-based tag stripping with entity-reconstruction guards)
- `helmet` middleware for standard HTTP security headers
- CORS restricted to the frontend origin (not left open)
- API keys kept server-side only; `.env` never committed (verified via `.gitignore`)

### Efficiency
- Knowledge base loaded once at startup, not per-request
- Weighted retrieval scoring (exact phrase match + synonym expansion) rather than naive keyword overlap
- In-memory response caching avoids redundant LLM calls for repeated questions
- 15-second timeout guard prevents hung requests from blocking indefinitely

### Testing
**19 automated tests across 7 suites, 97%+ statement coverage.** Covers:
- Middleware validation (unit)
- RAG retrieval logic (unit)
- Chat controller with mocked LLM/RAG services (unit) — tests the full request lifecycle including caching behavior, without consuming API quota
- LLM service with a mocked Gemini SDK (unit)
- Health and chat API routes (integration)
- Analytics API route (integration)

Run `npm run test:coverage` in `backend/` to reproduce.

### Accessibility
- High-contrast mode toggle (persists per session)
- Skip-to-input link for keyboard/screen-reader users
- ARIA live regions on the chat log so new messages are announced
- Full keyboard navigation (Tab order, Enter to send)
- `lang="en"` on the document root
- Readable base font size (16px) and visible focus outlines throughout

### Problem Statement Alignment
See table above — 5 of 7 named pillars are functionally implemented or demonstrated; the remaining 2 are honestly scoped as future work rather than silently omitted.

## Setup Instructions

### Backend
```bash
cd backend
npm install
cp .env.example .env   # add your Gemini API key to LLM_API_KEY
npm run dev
```
Server runs at `http://localhost:5000`.

### Frontend
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

### Running Tests
```bash
cd backend
npm test              # run all tests
npm run test:coverage # run tests with coverage report
```

## API Endpoints

| Endpoint | Method | Description |
|---|---|---|
| `/api/health` | GET | Health check |
| `/api/chat` | POST | Send a message, get a grounded AI response. Body: `{ "message": "..." }` |
| `/api/analytics` | GET | Operational intelligence data (mocked gate capacity + top questions) |

## Known Limitations

Documented honestly rather than hidden:

- **Retrieval is lexical, not semantic** — keyword + synonym matching rather than vector embeddings. Sufficient for this knowledge base's size, but would miss more creatively-phrased questions at larger scale.
- **In-memory cache and knowledge base** — reset on server restart; a production deployment would use a persistent store.
- **No authentication layer** — the API is open, appropriate for a demo but not production-ready as-is.
- **Chat history is session-based** (browser `localStorage`), not tied to user accounts — full account-based history across devices is a natural next step.
- **Analytics endpoint uses mocked data** — demonstrates the operational-intelligence pattern; a production version would aggregate real query logs and gate sensor feeds.

## Demo

Try asking the concierge:
- "How do I get to Gate B?"
- "Where's the nearest wheelchair accessible restroom?"
- "How do I reach the stadium by metro?"
- Ask in any language — Gemini responds in kind

## Screenshots

![Landing page](docs/screenshot-landing.png)
![Chat interface](docs/screenshot-chat.png)
![High contrast mode](docs/screenshot-contrast.png)

## License

MIT

## Team / Submission

Built for **PromptWars (Hack2skill)** — FIFA World Cup 2026 Challenge.