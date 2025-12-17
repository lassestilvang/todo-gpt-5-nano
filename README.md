# Daily Planner

## Overview
This project provides a modern, split-view daily planner with Inbox-style lists, per-view task boards, fuzzy search, and a local SQLite-backed data store. It includes seed data, migration tooling, tests, and CI coverage. The SQLite path is enforced in CI; a local in-process SQLite-like shim is available for development when native bindings are not yet present.

## Features
- Inbox default list and custom lists with color and emoji icons
- Tasks with name, description, dates, reminders, estimates, actuals, labels, subtasks, recurrence, attachments, and priority
- Views: Today, Next 7 Days, Upcoming, All (with toggle for completed)
- Subtasks, labels with icons, and attachments
- Fuzzy search (server-side) with client-side UX
- Dark mode and responsive, modern UI
- Seed data and a migration path to SQLite
- CI coverage for the SQLite path

## Tech Stack
- Frontend: Next.js 16 App Router, React, Tailwind CSS, Framer Motion
- Data: SQLite (production path) with a JSON-backed shim for local testing
- Validation: Zod-based input validation
- Testing: Bun test
- CI: GitHub Actions workflows

## Deployment & Health Check
- Health endpoint: /api/health
- Health payload: { status: 'ok' } on success
- DB health check uses adapter.health() when available

## Health & Diagnostics
- Endpoint: /api/health
- Returns 200 with { status: 'ok' } when SQLite path is healthy
- Returns 500 with error details if unhealthy

## Quick Start (Local Development)
- Install dependencies
  - `bun install`
- Run in JSON mode (default runtime path; can be overridden by DB_BACKEND)
  - `DB_BACKEND=json bun dev` or simply `bun dev`
- Run in SQLite shim mode (local testing path)
  - `export DB_BACKEND=sqlite`
  - `bun dev`
- Seed data (optional)
  - `bun run seed`
- Normalize existing legacy data (optional)
  - `bun run migrate`

## Migration to True SQLite (Production Path)
This project includes a migration bridge to a true SQLite database. The process is designed to be safe and repeatable.

1) Generate migration SQL from current data
   - `bun run migrate-sql`
   - This writes `data/sqlite_migration.sql`.

2) Import the migration into SQLite (local environment with native bindings)
   - Ensure you have SQLite tooling available
   - `sqlite3 planner.sqlite < data/sqlite_migration.sql` (or equivalent command for your environment)

3) Switch the app to the true SQLite backend
   - Set `DB_BACKEND=sqlite` in your environment
   - Ensure the runtime has native bindings installed (e.g., `better-sqlite3`)
   - Re-start the dev server: `bun dev`

4) Validate end-to-end
   - Visit: `/today`, `/week`, `/upcoming`, `/all`
   - Verify APIs: `/api/lists`, `/api/tasks?view=...`, `/api/search`, `/api/health`
   - Run tests: `bun test`

5) Optional: Replace the shim with a real SQLite adapter
   - Implement a real adapter (db/sqlite_adapter_real.ts) that mirrors the shim API
   - Swap wiring in `db/client.ts` to instantiate the real adapter when the environment supports native bindings

## Seed, Migrate, and Tests
- Seed: `bun run seed`
- Normalize JSON: `bun run migrate`
- Generate SQLite SQL: `bun run migrate-sql`
- Tests: `bun test` (Run in both JSON and SQLite modes; CI enforces the SQLite path)

## CI & Validation
- CI workflow enforces the presence of a true SQLite path for end-to-end validation in the `sqlite-integration` job
- A separate `sqlite-subtasks` integration test covers subtasks path on the real path
- Local development can continue to use the in-memory SQLite shim for quick iteration

## Data Model Summary
- Lists: id, name, color, emoji, created_at
- Tasks: id, list_id, name, description, date, deadline, reminders, estimate, actual_time, labels, priority, subtasks, recurring, attachment, completed, created_at, updated_at
- Subtasks, Labels, Task Labels, Reminders (normalized tables)
- Logs: task changes for audit trail

## How to Contribute
- Open issues, submit PRs, and we’ll review against the plan and CI expectations.

## License
- This project is provided as-is under the repository’s license.
