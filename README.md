# OperatorOS Business Diagnostic MVP

Greenfield Next.js MVP for diagnosing business strategy and operations before generating an optimization roadmap. The app includes:

- A public landing page with positioning and framework copy
- A multi-step assessment covering seven business functions
- Deterministic scoring and roadmap generation with stage-aware weighting
- A results preview that appears before email capture
- AI-polished report generation and email delivery hooks
- A lightweight password-protected admin dashboard

## Stack

- Next.js App Router + TypeScript
- Prisma + PostgreSQL
- OpenAI for report polishing
- Resend for outbound email
- Vitest for logic tests

## Local setup

1. Install Node.js 20+ and npm.
2. Install dependencies:

```bash
npm install
```

3. Copy environment defaults:

```bash
cp .env.example .env
```

4. For a fast local demo, keep `USE_IN_MEMORY_STORE="true"` in `.env`.
5. For database-backed mode, set `USE_IN_MEMORY_STORE="false"`, configure `DATABASE_URL`, then run:

```bash
npx prisma generate
npx prisma db push
```

6. Start the app:

```bash
npm run dev
```

## Important routes

- `/` landing page
- `/assessment` diagnostic flow
- `/results?id=<submission-id>` results preview and email unlock
- `/admin` internal dashboard

## Environment variables

- `DATABASE_URL` PostgreSQL connection string
- `OPENAI_API_KEY` OpenAI API key
- `OPENAI_MODEL` optional model override for report generation
- `RESEND_API_KEY` Resend API key
- `REPORT_SENDER_EMAIL` verified sender address for emailed reports
- `ADMIN_PASSWORD` simple MVP admin password
- `USE_IN_MEMORY_STORE` use `"true"` to run without Postgres during early development

## Notes

- Report generation falls back to a deterministic HTML/text report when no OpenAI key is configured.
- Email delivery fails gracefully and records status when Resend is not configured.
- PDF generation is currently represented as a placeholder URL and is the next obvious production-hardening task.

## Tests

Run the scoring tests with:

```bash
npm run test
```
