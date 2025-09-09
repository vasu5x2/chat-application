Career Counselor Chat (Next.js + tRPC + Prisma + Postgres)

Overview
- AI-powered career counseling chat app with session history.
- Tech: Next.js (App Router, TS), tRPC, TanStack Query, Prisma, Postgres (Neon/Supabase), Tailwind + shadcn/ui.

Quick Start
- Prereqs: Node 18+, pnpm or npm, a Postgres database URL.
- Copy `.env.example` to `.env` and set `DATABASE_URL` and an AI key (OpenAI or Together), e.g. `AI_PROVIDER=openai` and `OPENAI_API_KEY=...`.
- Install deps: `pnpm install` (or `npm install`).
- Generate Prisma client: `pnpm prisma:generate`.
- Create DB schema: `pnpm prisma:migrate` (for dev) or `pnpm prisma:push`.
- Run: `pnpm dev` then open http://localhost:3000.

AI Provider
- Set `AI_PROVIDER` to `openai` or `together`.
- For OpenAI: set `OPENAI_API_KEY`. Uses Chat Completions (model `gpt-4o-mini` by default).
- For Together: set `TOGETHER_API_KEY`. Uses `meta-llama/Meta-Llama-3-8B-Instruct-Turbo`.
- If no key is provided, the app uses a deterministic local fallback response.

Database
- Uses Prisma with Postgres.
- Schema: `User` (optional), `ChatSession`, `Message` with indexes on `userId`, `createdAt` and `(sessionId, createdAt)`.
- Anonymous users are tracked with a cookie `uid` to separate histories.

Architecture
- tRPC endpoint: `/api/trpc`.
- Routers: `chat` router for listing sessions, reading a session, and sending messages (persists user + AI responses).
- Frontend: `/` shows session list and new chat. `/s/[id]` shows the chat UI with message history and composer.

Deploy (Vercel)
- Create a new Vercel project from this repo.
- Set environment variables: `DATABASE_URL`, `AI_PROVIDER`, and the corresponding API key.
- Run the Prisma migration against your production DB (Neon/Supabase) locally or via CI, then `pnpm prisma:generate` on build.

Notes
- This repo uses strict TypeScript.
- tRPC uses TanStack Query under the hood for fetching/caching.
- UI components are minimal shadcn-style primitives (Button, Input, Textarea, ScrollArea).
# chat-application
