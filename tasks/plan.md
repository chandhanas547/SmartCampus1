# LabFlow execution plan

Prepared 20 October 2026. Status: proposed execution plan; M0 exists, M1 is incomplete.

## Handover and authority

Continue in this local desktop chat using `/home/milan/Projects/capstone`. The owner confirmed that this is an **individual submission** and the two original ICTAK DOCX files are all the submission information currently available. Do not ask again for a team or assume an LMS template, deadline, mentor, institution, or submission receipt exists.

Preserve commit `8b85cf247813ba8342a98d9a4c27e4f5871dc1ac`, the existing uncommitted DECISIONS changes, and SRS revision 0.2. The original DOCX files remain local, ignored, and unchanged. The takeover adds planning/review documents only.

Use SRS 0.2 and DECISIONS for the finalized JavaScript/JSX, 168-hour lending, registration, timezone, maintenance and return rules. MASTER_PLAN retains older provisional wording; DECISIONS explicitly supersedes it. Synchronize these documents when preparing the next SRS revision.

The existing project contract requires SRS approval **and submission before coding**. The DOCX references do not independently establish that separate LMS requirement. Keep the gate pending; lack of an LMS template is neither submission evidence nor authorization to waive it. The owner must confirm submission or explicitly revise this project sequencing constraint before M2.

## Execution sequence

| Milestone | Work | Evidence required to finish |
|---|---|---|
| M1 — SRS readiness | Adapt metadata for one author; reconcile document defaults; add mobile/desktop wireframes, diagrams and missing API validation details; resolve technical proposals using official sources. Prepare a reviewable SRS export with unknown institutional fields clearly identified. | Requirement counts and endpoint mapping preserved; export visually checked; owner approval recorded. Submission stays pending until an actual receipt or explicit owner confirmation exists. |
| M2 — Foundation | Pin compatible tools; scaffold React/Vite and Express separately; configure safe errors, validation, API client, environment examples and tests. Establish a transaction-capable development/test database. | Local client/server startup, lint/build, database readiness and real transaction rollback smoke check. Document commands before claiming success. |
| M3 — Identity | Deliver registration, login/session restoration, logout and controlled admin provisioning in small complete API/UI slices. | F1–F2 tests, duplicate/invalid input, role injection, ownership, expiry/logout, origin/CSRF and rate-limit boundaries. |
| M4 — Inventory | Deliver catalog/detail, inventory creation, versioned edits, maintenance/restoration and archive. | F3–F4 tests, archived visibility, stale edits, unique tags, open-request guards, keyboard/mobile checks. |
| M5 — Requests | Deliver idempotent submission/history, approval/rejection and cancellation using shared transactional circulation rules. | F5–F7 tests against a real replica set: competing approvals, rollback, duplicate creation, creation versus maintenance/archive, date boundaries and uncertain outcomes. |
| M6 — Handover and return | Deliver issue, damage report, inspection/return and maintenance restoration. | F8–F9 tests, expired issue, repeated return, report versus return, serviceable report resolution and retained pending requests after damaged return. |
| M7 — Complete UI | Deliver dashboard and complete navigation, loading/empty/error states and the main demonstration. | F10–F11 fixture checks and browser journey: register → request → approve → issue → report damage → damaged return → restore. |
| M8 — Verification | Run regression, authorization/security, accessibility and fresh-setup checks. Measure performance and agree any remaining browser targets. | Actual test/build/lint results, coverage against the approved threshold, keyboard/320px/200% checks, defect record and honest limitations. |
| M9 — Deployment | Verify current provider terms and free-tier limits; prepare the exact deployment configuration, secrets list and release commit for approval. Publish only after authorization. | HTTPS, deep-link refresh, live core flows, no localhost requests, safe browser/repository artifacts, runtime logs and rollback instructions. |
| M10 — Report and submission | Write the ICTAK report from recorded work, complete README, collect key/mobile screenshots and package repository/live links and reviewer instructions. | All prescribed report sections, fresh-clone walkthrough, accessible reviewer links and final checklist; final submission only when authorized. |

Each feature is a small API/database/UI slice with relevant tests, rather than completing the entire backend before the frontend. Detailed work is tracked in [todo.md](todo.md). Split a task further if it would touch more than about five files. Recheck documentation for the selected dependency versions at implementation time.

## Working agreement

- The owner has authorized local development work subject to the SRS gate. Routine reversible edits, tests, fixes and documentation do not need repeated permission.
- Report milestones with the exact checks executed and their outcomes. Keep passing, failing and not-run evidence distinct.
- After the gate, use focused `codex/` branches and meaningful commits without rewriting M0 or discarding existing changes. Review before merge.
- No remote is configured. Obtain the intended repository destination and visibility when publishing becomes actionable, not now.
- Ask for approval at the concrete publishing, payment or submission step. Use secure provider configuration for credentials; do not put credentials in chat, Git or report screenshots.
- Use synthetic demo identities. The owner's report authorship information is separate from application registration data.
- Keep one project record here; no copying prompts between OpenCode and this chat is required for the verified local work.

## Risks and decisions

| Item | Resolution |
|---|---|
| Submission instructions unknown | Prepare the document using the established IEEE-inspired draft; do not invent institutional acceptance or submission. |
| SRS lacks wireframes and complete field bounds | Complete during M1 before treating it as submission-ready. |
| Security details provisional | Agent researches and proposes a coherent policy before M3; record decisions and tests in the SRS instead of asking the owner to design security parameters. |
| MongoDB/Docker commands absent from PATH | Verify an appropriate local replica-set setup during M2. Do not substitute mocks for transaction evidence or assume a cloud database is accessible. |
| Package network access and hosting credentials unverified | Test access when required; report a concrete failure if encountered. No installation or provisioning has occurred in this handover. |
| Free hosting can sleep or change terms | Check provider documentation near deployment and explain evaluator impact before requesting publishing approval. |
| Unknown final deadline | Do not invent a delivery date; proceed by verifiable milestones. |

## Next checkpoint

Complete the M1 preparation tasks while retaining Draft status. Present the revised SRS and any remaining institutional blanks for owner review. Record approval and submission separately. Do not ask for unavailable college information again unless a concrete submission step requires it.
