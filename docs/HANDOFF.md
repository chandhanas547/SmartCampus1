# LabFlow current handoff

Updated 22 October 2026. Read this first after moving to another chat, then inspect actual Git status. This file describes project state; it is not approval/submission evidence.

## Owner instructions and authority

- Individual ICTAK submission. The two local DOCX references are all the institutional guidance currently available. Name/student ID, institution, mentor, deadlines and LMS procedure remain unknown; do not repeatedly ask for unavailable details or invent them.
- On 21 October the owner said “start building,” superseding the old SRS-before-coding gate. SRS is revision 0.3 Draft; approval and submission remain pending. Revision 0.2 is preserved in checkpoint commit `9cfdb2f`.
- Routine local development, tests, fixes, documentation and focused local commits are authorized. Publishing, payments and final submission need approval for the concrete action.
- Continue developing in this chat until a real external approval/access blocker; milestone completion is a progress update, not a reason to stop. Keep documentation current because development may move between chats. Prefer economical model use; report milestones so the owner can switch models. The running chat cannot switch its own model.

## Actual implementation

M0 commit `8b85cf2` is preserved. Work is on the current feature branch; inspect `git branch --show-current`. The verified M2 implementation is commit `8b9f079`; later documentation commits record its evidence.

M2 foundation includes an npm workspace with pinned Node/npm/dependencies, Express readiness and safe error boundaries, strict environment validation, security headers, JSON/origin/body-size guards, React/Vite preview, same-origin API client, persistent local replica-set runner, real database transaction smoke tests, static/deep-link tests and a CI definition.

M3 identity is implemented and verified: student registration, normalized unique email, scrypt hashes, MongoDB sessions, login/regeneration/restoration/logout/expiry, strict CSRF checks, MongoDB-backed auth limits and controlled admin provisioning. Browser registration, reload restoration and logout passed. Inventory, circulation and dashboard are implemented. Fourteen real database domain acceptance/race/fault checks pass. The browser journey passed creation/edit, request, approval, issue, damage report, inspected damaged return and restoration. Responsive catalog/dashboard checks at 320px and keyboard skip navigation passed. The 18 saved axe screen-state reports have zero violations/incomplete findings; keyboard core flows and 200% CSS content enlargement passed. Native browser zoom and other browser engines remain unverified. Fresh-clone and production startup checks are next. See `docs/SECURITY.md` for exact policies.

At this checkpoint the local database and development servers were running on 27017, 3000 and 5173. They may not survive a chat/app restart; check ports before starting duplicates. Run/setup commands and environment meanings are in README. Local startup uses `npm run db`, `npm run dev:server`, `npm run dev:client`; verification uses `npm run check`. `server/.env` is ignored. Use synthetic data only. Do not copy local credentials into this handoff.

## Verification and evidence

See `docs/evidence/m2/verification.md` for commands, outcomes and limits. Desktop and 320px screenshots are in that directory. The API/config/static tests and client API tests run separately so all cases report individually on Node 24.21.0; do not weaken or remove assertions to change the runner output.

CI is defined but has not run remotely. No Git remote or deployment exists. Never claim hosted success from local tests.

## Plugins and tooling

- MongoDB Atlas plugin is installed and connected. A read-only project listing succeeded and found project `assignment`. No cloud resources, access lists, users or collections were changed. Re-inspect available projects/clusters when deployment becomes actionable; do not assume this project is the capstone destination.
- GitHub plugin discovery reported not installed. It is optional for local progress; repository publication can be prepared later using an authorized connector or CLI.
- In-app browser was used for local verification. Chrome DevTools MCP was not exposed; do not claim DevTools/axe/full-browser-matrix checks happened.
- Shared engineering skills in `~/.agents/skills` are readable and available. Six Ponytail skills in `~/.config/opencode/skills` are readable but not automatically registered as commands here.

## Next task

M4–M6 core lifecycle and dashboard counts are locally verified on `codex/inventory-circulation`. See `docs/evidence/m4-m7/verification.md`. Continue M7/M8 with automated accessibility, keyboard/zoom, clean setup and measured performance. Backend increment `e4bb9c9` and browser UI increment `cff91af` are saved. M8 coverage gate passes (99.40% lines/92.31% branches on critical modules), and the documented online clean install passed with scripts disabled. Inspect `docs/evidence/m8/verification.md` and actual Git status. Performance measurement must wait for the auth window; do not reset it. Continue fresh-clone/production smoke, document synchronization/export and a concrete deployment proposal. No cloud publishing is authorized.
M1 wireframes, field bounds and final SRS export remain open in parallel. Do not mark M1 complete just because coding was authorized.

## Migration procedure

1. Read AGENTS, this file, DECISIONS and the task queue; inspect branch/log/status and any changes made since this record.
2. Read the relevant source/tests and SRS sections for the next slice.
3. Continue the existing task; verify before committing. Keep unrelated user edits intact.
4. Update this file, task state and evidence at the next checkpoint. Record incomplete work and failures if interrupted.
