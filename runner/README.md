# SiliconPath isolated toolchain

The deployed Next.js API authenticates the Supabase user, reserves a database-enforced quota slot, then runs only registered educational contracts in a disposable Vercel Sandbox microVM. User code never runs inside the web application process.

## Toolchain

Ubuntu 26.04; Icarus Verilog 12.0; Verilator 5.032; Python 3.14; Cocotb 2.1.0; make 4.4.1. Bootstrap trusted packages with restricted package-repository egress, then set deny-all before snapshotting. Evaluations always use deny-all, one vCPU, a 45-second lifetime and bounded subprocesses. No deployment credentials are copied into the VM.

Set RUNNER_PROVIDER=vercel and RUNNER_SNAPSHOT_ID in Vercel. The deployment uses built-in OIDC. The build preparation script converts an expiring bootstrap into a non-expiring snapshot; point the environment variable at that stable snapshot after the initial deployment. See the root README for provisioning.

## Contracts and results

lib/grader-cases.ts owns the twenty fixed contracts. GET /api/run exposes capabilities; GET /api/run?exercise=mux2 exposes the educational testbench. POST accepts exerciseId, source, language and an optional iverilog, verilator or cocotb engine. Cocotb currently supports mux2. Python contracts always use Python.

A successful evaluation returns passed, actual output, engine, exact-source SHA-256, run ID, test summaries and a bounded VCD when produced. Infrastructure failures return non-2xx and assign no learning result. These public course contracts are not adversarial certification tests. Open-ended projects remain evidence-based, self-reported work.

## Verification

All twenty reference contracts passed in the prepared toolchain. Intentionally incorrect RTL and Python were rejected. Additional mux2 regressions passed with Verilator and Cocotb. The application test suite checks assessment reachability, backup preservation, import behavior and VCD parsing.
