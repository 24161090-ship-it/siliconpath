# SiliconPath

A personal engineering learning workspace for Digital IC Design, Design Verification and FPGA, with an internship preparation goal for 2027.

## Included

- Responsive dark/light workspace, global search and an evidence-based dashboard.
- 26 readable lessons across five roadmap tracks; prerequisites and explicit mastery rules.
- 12 exercises with specifications, test cases, progressive hints and explanations.
- Automatically scored knowledge checks; Monaco code editor, autosaved drafts, submission history, personal notes and self-assessed evidence.
- Project templates, evidence checklists, public GitHub repository inspection, Markdown README export and standalone HTML portfolio export.
- Markdown/LaTeX knowledge vault, mistake journals and flashcards.
- Weekly planner, rescheduling, real study-session logs and a persistent Pomodoro timer.
- Analytics based on saved activity, application tracking, interview rubrics and a printable English CV (use Save as PDF in the browser).
- Personal content editor with JSON validation; full workspace backup/restore.
- Optional Supabase email-link authentication, per-user cloud storage, row-level security and optimistic concurrency checks.

## Current deployment mode

Without Supabase environment variables, the application runs in **device mode**. Records persist in this browser's localStorage. They do not synchronize across devices, private browsing or cleared browser data. The UI labels this mode. Export backups regularly.

This release implements the learning MVP and personal project/career workflows. It does **not** claim all five phases of the original vision are complete. Google sign-in, hosted attachment storage, autonomous AI tutoring, a production simulation cluster, OAuth GitHub account synchronization and hosted public portfolios remain future integrations. Public GitHub inspection is read-only; exporting an HTML portfolio does not publish it automatically.

## Local development

Requires Node.js 22+ and pnpm 11+. Dependencies are pinned with pnpm-lock.yaml.

```sh
pnpm install
pnpm dev
pnpm typecheck
pnpm test
pnpm build
```

## Enable cloud authentication and persistence

1. Create a Supabase project.
2. Run `supabase/migrations/001_workspace.sql` in its SQL Editor. It creates one JSONB workspace per authenticated user with RLS policies. No service-role key is needed or allowed in client code.
3. Set these variables in Vercel for the intended deployment environments:
   - `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL.
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: public anon/publishable key.
4. In Supabase Authentication URL Configuration, set the Site URL to your production origin and allow that exact redirect origin (and `http://localhost:3000` for local development).
5. Enable email authentication, configure a production SMTP provider and appropriate Supabase auth rate limits. Redeploy after setting the environment variables.
6. Export your existing device backup **before signing in**. Authenticated and guest workspaces are intentionally isolated. Sign in through Settings, then import the backup into your cloud workspace.

Cloud saves debounce by 800 ms. Wait for “Synced to cloud” before switching devices. Concurrent changes from another device pause cloud writes instead of overwriting remote data. Export the local backup and reload to reconcile. This is whole-workspace optimistic locking, not real-time collaborative editing. A cloud outage retains a local copy and shows an error; it does not silently declare synchronization successful.

## Code execution

**No code runs in the Next.js server process.** Without a configured runner, Run simulation returns an explicit 503 explaining that execution is unavailable. Code submissions remain Needs review or Self-assessed. Quiz scoring is distinct from simulation.

To enable a runner, deploy a separately isolated service and set server-only `RUNNER_URL` and `RUNNER_TOKEN`. The `/api/run` route authenticates with Supabase, limits request size, permits only registered exercise/language pairs, enforces a timeout and forwards an authenticated JSON request:

```json
{"userId":"uuid","exerciseId":"counter","language":"verilog","source":"..."}
```

The runner must return `{ "passed": true, "output": "actual test logs" }` only after actual execution against trusted tests. It is responsible for per-user rate limits, a bounded queue, CPU/RAM/disk/time limits, network isolation, non-root containers and fixed server-owned public/hidden testbenches. Never trust tests supplied by a learner. The repository includes `runner/README.md` as the integration contract, not a falsely working execution service.

## Deployment

Import `24161090-ship-it/siliconpath` into Vercel. Framework: Next.js; repository root is the application root. The linked Git integration deploys changes from `main`. Device mode works without environment variables. Optional cloud setup is described above.

## Data and assessment semantics

- Initial missions are suggested planned tasks, all incomplete; they are not claimed accomplishments.
- Checking a task does not add estimated minutes to actual study time.
- Reading a lesson does not establish mastery. Mastery requires both reading and a Passed linked assessment. Self-assessments never count as an automated pass.
- Project readiness checklists and evidence are explicitly self-reported. Internship readiness is not assigned an invented score.
- Notes are rendered as sanitized Markdown without raw HTML. Exported portfolio fields are HTML-escaped and repository links allow only HTTPS GitHub URLs.
- The content studio changes only the current user's curriculum. It is not a site-wide administrator role.
- Email, code and notes appear only in the user's own workspace and exported files; the shipped repository has no learner records or secrets.

## Stack

Next.js App Router, React, TypeScript, CSS custom properties, Lucide icons, Monaco Editor, React Markdown/KaTeX and Supabase. Fonts load from Google Fonts; Monaco's default loader uses its CDN and requires browser network access.
