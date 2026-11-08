# SiliconPath 2.0

Personal engineering learning and internship preparation for Digital IC Design, RTL and Design Verification.

- **Live:** https://siliconpath-tau.vercel.app
- **Source:** https://github.com/24161090-ship-it/siliconpath

## What works

26 expanded lessons across five tracks, each with a reachable assessment path. The library contains 82 exercises: lesson checkpoints, realistic debugging scenarios, coding contracts and evidence-based verification tasks. Twenty exercises have executable tests.

The learning loop is read → checkpoint → practical test where required → inspect the actual result → document mistakes → build project evidence. Mastered means the node’s specified course assessments are complete; it is not a claim of professional competence in the entire topic. Historical v1 data remains intact, but expanded assessment requirements can require new work.

The workspace also includes a weekly planner, Pomodoro/session history, Markdown/LaTeX notes, mistake journal, flashcards, skill analytics, engineering project workspaces, CV/portfolio export, interview rubrics, an application tracker and a November 2026–June 2027 development plan.

## Authentication and persistence

Supabase email-link sign-in stores an authenticated workspace per user. RLS permits only the owner to read/write their workspace. Local device mode remains usable without an account. Device and authenticated workspaces are separate; the UI offers an explicit device import after sign-in. Distinct records combine; matching IDs preserve existing cloud records.

Cloud writes use optimistic revision checks. A conflicting write or failed request pauses sync and retains the local copy. Export a backup before reloading to reconcile. Wait for **Synced to cloud** before switching devices. This is not collaborative real-time editing.

Settings supports complete JSON backup/restore. Restore replaces the current workspace after confirmation. A backup is private learner data and must not be committed to this public repository.

## Executable practice

`POST /api/run` authenticates a Supabase bearer session, validates the request and reserves a quota slot through a PostgreSQL RPC before creating a disposable Vercel Sandbox microVM. User code never executes in the Next.js process.

- One vCPU / 2 GB VM; no network egress during evaluation; no host mounts or deployment credentials injected into the VM.
- 45-second VM lifetime, bounded compiler/simulator commands, file/output limits and guaranteed stop in `finally`.
- Source request limit: 100 KB. Per-account limit: 20 reservations/day, 45-second cooldown. Project-wide cap: 100/day, protected by an advisory transaction lock.
- Fixed server-owned tests. A zero exit code alone is insufficient: the harness completion marker must be present. Infrastructure errors do not assign an assessment result.
- Icarus Verilog 12.0, Verilator 5.032 and Python. The mux2 contract additionally supports Cocotb 2.1.0 with Icarus.
- Results include exact source SHA-256, run ID, engine and actual output. VCD is retained up to 300 KB per evaluation; manually opened VCDs may be up to 1 MB.

Tests are visible educational contracts, not secret certification tests. Open-ended verification exercises without a registered executable contract use clearly labeled evidence review. Self-assessed results never count as automated passes. Project coverage/checklists are also self-reported.

## Run locally

Node.js 22+ and pnpm 11.25.0 are supported.

```sh
pnpm install --frozen-lockfile
pnpm typecheck
pnpm test
pnpm build
pnpm dev
```

Set public Supabase URL/key in `.env.local`. Never use a service-role key in browser code. Local simulation additionally needs a valid Vercel OIDC context from a linked project; without that context, use the deployed application for execution.

## Provisioning

1. Apply `supabase/migrations/001_workspace.sql`, then `002_assessments_and_runner.sql` to a dedicated Supabase project.
2. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in the intended Vercel environments.
3. Configure Supabase Site URL and allowed redirects for the exact production origin and local development origin. Keep email verification enabled. Built-in Supabase mail has provider limits; configure your own SMTP if broader usage is needed.
4. Set `RUNNER_PROVIDER=vercel` and `RUNNER_SNAPSHOT_ID` to a prepared toolchain snapshot. Sandbox calls authenticate using deployment OIDC, not a client token.
5. The build script `scripts/prepare-toolchain.mjs` promotes an expiring bootstrap snapshot into a non-expiring deny-all snapshot using the SDK and records its ID in the build-local, ignored `lib/toolchain.generated.json`. After the first deployment, point the Vercel variable at that non-expiring snapshot for future builds. Snapshot IDs are configuration, not credentials.
6. Build, deploy, then verify real sign-in → cloud save → reload → authenticated simulation → persisted history. Do not infer live operation solely from the presence of source code.

## Tests and verification

`pnpm test` covers complete roadmap assessment reachability, practical requirements, quiz scoring, device/cloud import conflict behavior, backup validation, VCD parsing and evidence-based streaks. The toolchain was separately checked against all 20 reference contracts, incorrect RTL/Python mutations and a Verilator regression. See `CHANGELOG.md` and the delivered verification report for release evidence and limitations.

## Scope

This release does not claim autonomous AI tutoring, OAuth GitHub synchronization, hosted shared portfolios, object-storage attachments, Google Calendar integration or community accounts. The existing public GitHub repository check is read-only. Personal content edits belong to the current workspace.
