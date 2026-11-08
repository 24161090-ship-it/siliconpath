# Isolated execution service contract

The Vercel application never evaluates, compiles or executes user code. The configured service must be independently secured and authenticated with the server-only RUNNER_TOKEN.

Accept POST JSON with `userId`, `exerciseId`, `language`, `source`. Permit only the registered exercise IDs and fixed languages. Fetch testbenches from a trusted server-owned registry. Never accept a command, filesystem path, testbench or runner image from the browser.

Required controls: per-user/IP quotas, bounded queue and concurrency, non-root disposable container/VM, read-only base filesystem, capped temporary disk, no network egress, no host mounts, no privileged mode, CPU/RAM/process limits, output truncation, wall-clock timeout and destruction after every job. The service must rate-limit requests before allocating compute.

Return `200 {"passed":boolean,"output":"actual compiler and test summary"}` for completed evaluations. Use non-2xx for queue, infrastructure and authentication failures. These must not be interpreted as failed learner assessments. The Next.js proxy times out after 20 seconds and clips returned logs to 50,000 characters.

For manual local practice: download source from the lab, execute it with a local Icarus Verilog/Verilator/Python/Cocotb toolchain and paste the command and result into evidence. These records stay Self-assessed and do not become automated passes.
