# 2.2.0 — 2026-11-08

- Deepened 24 core lessons with 48 worked derivations, 48 reasoning questions, optional hints/answers, selected diagrams, trace tables and SV examples.
- Added twelve focused SV/DV publisher references and related project briefs in Reader practice.
- Fixed parent read markers when a child is unmarked; preserved notes/bookmarks and mastery rules.
- Added named-file delete confirmation, owner-only Storage removal, strict server confirmation, evidence detachment and deletion tombstones in device merges.
- Added idempotent migration 004 and five focused regression tests. Existing runner contracts and exercise/project IDs remain unchanged.

# 2.1.0 — Learning Content & Resource System (2026-11-08)

- Added a persistent Learning Reader with 66 focused units, source references, practice links and personal notes.
- Added 40 curated publisher resources, private PDF/image/log uploads and account-bound document viewing.
- Preserved all existing content IDs; added 12 selected manual challenges, explicit evidence/checklists and separate self-verified completion.
- Added 16 detailed project paths, English evidence outlines, new vault note types and history-based dashboard suggestions.
- Kept workspace version 1 with optional additive fields, owner-only Storage migration and unchanged runner/assessment contracts.
- Expanded compatibility/graph/backup/manual-status tests.

# SiliconPath 2.0 — 2026-11-08

## Learning and assessment

- Every one of the 26 roadmap nodes now has a scored knowledge checkpoint. Coding-focused nodes additionally require an executable practical contract. Reading and self-assessment alone never award mastery.
- Library expanded to 82 exercises: 26 lesson checkpoints, 29 focused engineering/debugging scenarios, and the original exercises plus 15 new coding contracts. Twenty coding exercises have executable server-owned tests.
- Lessons include worked examples, common failure modes, evidence tasks and explicit completion criteria. Checkpoint verification refers to course outcomes, not blanket professional mastery.
- Old submissions and notes remain intact. New assessment requirements may mean a previously completed node needs an additional checkpoint.

## Real engineering practice

- Authenticated code execution in disposable Vercel Sandbox microVMs. Each evaluation uses a prepared toolchain snapshot, one vCPU, a 45-second VM lifetime, bounded commands/output and a deny-all network policy.
- Icarus Verilog, Verilator and Python contracts; a Cocotb + Icarus option for the mux2 contract.
- Actual compiler/simulator logs, source SHA-256, run ID, engine, result history and VCD waveforms. Open-ended FIFO/UART/APB verification tasks retain evidence review until a suitable executable contract is defined.
- Waveform viewer supports uploaded VCDs, signal selection, zoom, time cursor and downloads.
- Per-account cooldown/daily limits and a project-wide daily cap are enforced transactionally in PostgreSQL before sandbox creation.

## Cloud and portfolio

- Supabase email-link authentication and per-user cloud workspaces with RLS; optimistic revision checks prevent silent overwrites from another device.
- Explicit device-to-cloud import combines distinct records and preserves existing cloud records on matching IDs. Guest data is retained separately.
- Failed cloud writes pause instead of retrying silently over remote changes. Unsaved cloud changes warn before closing.
- Project architecture, editable milestones, requirement-linked test plans, bug logs, separate coverage metrics and verification-report export.
- November 2026–June 2027 internship development plan, with explicit user actions to add milestones to the study planner.
- Focus sessions complete across app sections, not only while the Overview component is mounted.

## Boundaries

No autonomous AI tutor, OAuth GitHub account synchronization, automatic job application sending, or community features are claimed. Repository inspection is public/read-only. Project results/coverage entered by the learner remain labeled self-reported, separate from Practice Lab evaluations.
