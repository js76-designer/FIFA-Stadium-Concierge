# Architecture Overview

## Design Principles
1. **Separation of concerns** — routes handle HTTP, controllers orchestrate, services contain business logic, middleware handles cross-cutting concerns (validation, rate limiting, security headers).
2. **Fail fast, fail honest** — the server refuses to start without a valid API key; the LLM is explicitly instructed to admit gaps in its knowledge rather than hallucinate.
3. **Test what's testable without cost** — the LLM and its SDK are mocked in unit tests so the full request lifecycle (including caching and error paths) is verified without consuming API quota on every test run.

## Request Lifecycle
1. `POST /api/chat` hits `chatRateLimiter` (rate limiting) → `validateChatInput` (sanitization) → `handleChat` (controller)
2. Controller checks an in-memory cache; on a miss, calls `retrieveContext()` (RAG) then `generateAnswer()` (Gemini)
3. Response is cached and returned as JSON

## Why RAG Instead of Fine-Tuning
Fine-tuning a model on stadium-specific data would be slower to iterate on, costlier, and harder to keep current (a gate reassignment would require retraining). RAG lets the knowledge base be edited as plain markdown files with zero model changes — appropriate for a domain where facts (gate numbers, schedules) change between events.

## Trade-offs Made Under Time Constraints
- Keyword + synonym retrieval instead of vector embeddings (sufficient for this knowledge base's size; documented in README's Known Limitations)
- In-memory cache instead of Redis (appropriate for demo scale; would need a persistent store for multi-instance production deployment)
- No authentication layer (appropriate for a public information kiosk use case; would be required if this handled any personal data)