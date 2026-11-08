# SiliconPath 2.2.1 — Curriculum Quality Review

Personal engineering learning and internship preparation for Digital IC Design, RTL and Design Verification.

- **Live:** https://siliconpath-tau.vercel.app
- **Source:** https://github.com/24161090-ship-it/siliconpath

## What works

The original 26 roadmap modules and all 82 existing exercises retain their IDs. Sixty-six focused study units cover the requested five tracks with original explanations, worked examples, diagrams/tables/formulas where relevant, pitfalls, prerequisites and linked practice. The library now contains 94 exercises, including twelve selected design/calculation/verification-planning challenges. Twenty existing exercises retain executable tests.

Learning Reader includes Theory, References, Practice and Notes; course outline, section TOC, saved position, search, bookmarks, reading mode, previous/next navigation and optional Vietnamese explanations. Reading progress records position, not understanding. Fifty-two curated resources link to verified publisher destinations with title, organization, section, level, estimate and review date. External publisher content opens at the original site.

Sixteen project learning paths provide technical specifications, architecture guidance, milestones, verification requirements, expected deliverables, pitfalls, related theory/exercises/resources and an English evidence outline. The Knowledge Vault adds Code Snippet, Formula and Project Documentation note types. Dashboard suggestions use actual reading and submission history.

The learning loop is read → checkpoint → practical test where required → inspect the actual result → document mistakes → build project evidence. Mastered means the node’s specified course assessments are complete; it is not a claim of professional competence in the entire topic. Historical v1 data remains intact, but expanded assessment requirements can require new work.

The workspace also includes a weekly planner, Pomodoro/session history, Markdown/LaTeX notes, mistake journal, flashcards, skill analytics, engineering project workspaces, CV/portfolio export, interview rubrics, an application tracker and a November 2026–June 2027 development plan.

## Authentication and persistence

Supabase email-link sign-in stores an authenticated workspace per user. RLS permits only the owner to read/write their workspace. Local device mode remains usable without an account. Device and authenticated workspaces are separate; the UI offers an explicit device import after sign-in. Distinct records combine; matching IDs preserve existing cloud records.

Cloud writes use optimistic revision checks. A conflicting write or failed request pauses sync and retains the local copy. Export a backup before reloading to reconcile. Wait for **Synced to cloud** before switching devices. This is not collaborative real-time editing.

Settings supports complete JSON backup/restore. Restore replaces the current workspace after confirmation. A backup is private learner data and must not be committed to this public repository.

## Guided core lessons (2.2.1)

Thirty-two core units add original guided explanations, two step-by-step worked cases and two pre-code reasoning questions with optional hints/answers. Topics include FSM derivation, combinational/sequential RTL, sampling/debugging, verification planning, SV OOP/interfaces/tasks, transaction checking, SVA, coverage, constrained random, UVM, closure, FIFO/APB/UART. Selected units include ownership/architecture diagrams, timing/acceptance tables and SystemVerilog study snippets. The runner's twenty existing contracts remain unchanged; snippets requiring class/randomization/coverage features need a capable local simulator.

Twelve focused references from ChipVerify, Siemens Verification Academy and OpenTitan supplement the original forty. Publisher links were checked on 2026-11-08; some Academy chapters may require a publisher account. Reader practice also shows related project briefs and milestones.

Mark-as-read now recalculates the parent module in both directions. Removing a child's marker removes a stale parent marker without changing notes/bookmarks or assessment results.

## Local practice and private documents

Every exercise has related theory, design-before-code guidance and a persistent seven-item completion checklist. Source/repository links, local command/log, notes, mistakes, lessons learned and private waveform/document attachments form the evidence record. A complete checklist plus evidence can be explicitly confirmed as **Completed – Self Verified**. That confirmation creates a clearly labeled self-assessed history record and never creates an automated pass or changes legacy mastery rules. Editing evidence/checklists or the source draft clears confirmation. Knowledge-check results are labeled separately from executed code results.

Apply `supabase/migrations/003_learning_documents.sql` once for the private `learning-documents` bucket and owner-folder SELECT/INSERT policies. Upload requires sign-in, allows PDF/PNG/JPEG/plain-text formats up to 10 MB and verifies basic file signatures. Metadata stays in the workspace; originals stay in private Storage. Fifty documents per workspace are supported. Apply `supabase/migrations/004_delete_learning_documents.sql` for owner-folder DELETE access. In My documents, Delete opens a named-file confirmation. Only a server-confirmed Storage removal removes metadata; failure preserves the entry. Related evidence links are detached and self-verification is cleared, while original submission history is retained. Deletion tombstones prevent deleted metadata from returning through device-to-cloud merge. JSON backups do not restore deleted binaries. PDF/image/text preview downloads through the authenticated storage client, uses a local object URL and revokes it when closed. A workspace JSON backup contains metadata, not document binaries; download originals separately for an independent archive. No third-party book is copied or republished.

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

1. Apply `supabase/migrations/001_workspace.sql`, then `002_assessments_and_runner.sql`, then `003_learning_documents.sql` to a dedicated Supabase project. For an existing installation, apply only migrations not already applied.
2. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in the intended Vercel environments.
3. Configure Supabase Site URL and allowed redirects for the exact production origin and local development origin. Keep email verification enabled. Built-in Supabase mail has provider limits; configure your own SMTP if broader usage is needed.
4. Set `RUNNER_PROVIDER=vercel` and `RUNNER_SNAPSHOT_ID` to a prepared toolchain snapshot. Sandbox calls authenticate using deployment OIDC, not a client token.
5. The build script `scripts/prepare-toolchain.mjs` promotes an expiring bootstrap snapshot into a non-expiring deny-all snapshot using the SDK and records its ID in the build-local, ignored `lib/toolchain.generated.json`. After the first deployment, point the Vercel variable at that non-expiring snapshot for future builds. Snapshot IDs are configuration, not credentials.
6. Build, deploy, then verify real sign-in → cloud save → reload → authenticated simulation → persisted history. Do not infer live operation solely from the presence of source code.

## Additive data compatibility

Workspace schema remains version 1. The optional `learning` object adds readings, reference bookmarks, local-practice evidence and document metadata. Missing fields are treated as empty by readers without rewriting existing data. Existing notes, projects, submissions, drafts, timer and assessments retain their IDs and semantics. Explicit device import merges new records while preserving current-cloud conflicts. New fields are validated in backups; import accepts JSON up to 25 MB. Cloud revision checks remain in force.

## Tests and verification

`pnpm test` covers complete roadmap assessment reachability, practical requirements, quiz scoring, device/cloud import conflict behavior, backup validation, VCD parsing and evidence-based streaks. The toolchain was separately checked against all 20 reference contracts, incorrect RTL/Python mutations and a Verilator regression. See `CHANGELOG.md` and the delivered verification report for release evidence and limitations.

## Scope

This release does not claim autonomous AI tutoring, OAuth GitHub synchronization, hosted shared portfolios, Google Calendar integration or community accounts. The existing public GitHub repository check is read-only. Personal content edits belong to the current workspace.

## Curriculum quality checks

Run `pnpm verify:curriculum` with Icarus Verilog (iverilog/vvp) and Python on PATH. Compile tests first if running the script directly: `pnpm exec tsc --project tsconfig.test.json`, then `node scripts/check-curriculum.mjs /path/to/qa-output`. Optional IVERILOG_BIN, VVP_BIN and PYTHON_BIN choose executables. With OSS CAD Suite on Windows, activate its bin and lib paths in the current shell; do not mix incompatible MSYS runtime libraries. Results are local files and never update cloud progress.

The check runs all twenty executable references, rejects six behavioral mutations, and reviews ten core topics. It includes exhaustive ten-bit FSM streams (10,240 observations), counter widths 1/3/4/5 and all 65,536 eight-bit signed addition pairs. SVA is checked through a sampled discrete model; functional coverage examples are checked through a Python model. These are not native temporal-SVA or covergroup execution claims. Full cloud execution and simultaneous multi-device edits require separate authenticated checks.

Reader order is explanation → worked examples → pre-code reasoning → technical view. The four-bit ALU lesson and project now share the exact ADD/SUB/AND/XOR op encoding used by the existing contract. Full JSON restore retains known document deletion markers as well as device-to-cloud merge. Binary documents still require separate original-file backups.
