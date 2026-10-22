# LabFlow current handoff

Updated 22 October 2026. Read this first after a chat change, then DECISIONS and tasks/todo; inspect actual Git status/log. This is state documentation, not SRS approval, publication or submission evidence.

## Authority and scope

Individual ICTAK demo capstone: one lab, students and administrators, JavaScript/JSX, React/Vite, Express, MongoDB/Mongoose. The owner authorized coding on 21 October 2026 before SRS approval. Do not restore the obsolete pre-coding gate. Continue authorized local work across milestones; do not ask to continue at a checkpoint. Focused local codex/ branches/commits are authorized; preserve M0 and unfinished work. No agents without explicit authorization. The running model cannot switch itself; the owner prefers economical use.

The two original DOCX references are the only supplied institutional guidance. Individual name/student ID, institution/mentor, deadline and LMS procedure remain unknown; do not invent them or repeatedly ask for unavailable details. Publishing, cloud provisioning, payments and actual college submission require concrete approval. No paid resources or real-person demo data.

## Verified local state

- M0 `8b85cf2` is preserved; original DOCX hashes remain unchanged and files ignored. SRS 0.2 is preserved at `9cfdb2f`.
- Backend lifecycle increment `e4bb9c9`, browser UI `cff91af`, quality gate `6c42ac7`, cold-download fix `94bc7e9`, hidden-checkout/production-cookie regressions `a8a84f9`. Later checkpoints record final tests/docs; inspect actual log rather than assuming this is HEAD.
- Identity, inventory, versioned editing, maintenance/archive/restore, borrowing/replay, decisions/cancellation, issue, damage reporting, inspected return/history and dashboard are implemented. Fourteen original domain race/fault cases plus the final all-route authorization matrix pass.
- Final local check: 44 tests (12 server fast + five client + 27 integration), lint and production build pass. Critical coverage: 99.40% lines, 92.83% branches; unchanged 80% aggregate gates enforced. See EVIDENCE_INDEX and evidence/m8/verification.md.
- Real MongoDB 8.0.34 replica-set tests prove competing approvals, request/archive/maintenance and report/return races, replay and injected approval/return rollback. Browser mocks are not concurrency evidence.
- Actual student/admin browser journeys passed. Seventeen core axe 4.14.0 reports and an additional environment-recording run show zero violations/incomplete findings. Keyboard core flows, 320px views and 200% CSS content enlargement passed. In-app browser reports Chrome 155.0.0.0/Linux; native browser zoom, standalone stable-browser acceptance, screen readers and other engines remain unverified. Native zoom shortcut did not change the viewport; do not relabel CSS zoom as native.
- A fully cold clone at `94bc7e9` installed with scripts disabled, downloaded the pinned MongoDB binary and passed check/coverage. This fixed a concurrent first-download lock failure. The production process with development dependencies pruned passes readiness, built assets, hidden-checkout deep links and simulated HTTPS proxy session checks at `a8a84f9`; public TLS/Render behavior remain unverified.
- Local warm reads: p95 7.66ms equipment, 5.14ms requests, 5.42ms dashboard; login sample 307.5ms. Small synthetic loopback dataset only. An earlier 429 was allowed to expire; never reset auth limits to force a measurement.
- Known local random-secret scan found zero matches in proposed files/history; scope and counts are in artifact-scan.json. Dependency audit reported zero vulnerabilities. No remote CI or hosted release has run.

## Documents and release preparation

SRS 0.4 Draft is synchronized with selected engineering policies and exported to docs/exports/LabFlow_SRS_DRAFT_0.4.docx. All 23 rendered pages were reviewed; 13 sections, F1–F11, 29 NFR definitions, 10 use cases and 19 endpoints remain. SRS_READINESS records remaining blanks and approval/submission status. Supporting layouts/diagrams are in DESIGN; exact bounds/security/quality policies in API_DETAILS, SECURITY and QUALITY.

REPORT_DRAFT follows all nine ICTAK report sections with genuine local results. It is not final: live results, author metadata and submission details remain pending. DEPLOYMENT and render.yaml propose a public GitHub labflow repository, a separate Atlas Free project/cluster and one Render Free service. Nothing has been published/provisioned. Proposed release must use a no-payment-method free workspace so quota exhaustion cannot charge overages. Render Free has no shell: admin provisioning/cloud acceptance need approved temporary operator IP access and local commands with ignored secrets.

## Tools and local startup

Node 24.21.0/npm 11.19.0; root workspace and package-lock only. Use npm ci --ignore-scripts. Dependency scripts remain disabled. Startup: npm run db, npm run dev:server, npm run dev:client. Check ports 27017/3000/5173 before duplicates; processes and /tmp may not survive chat/app changes. .local contains ignored persistent development data, cached binaries, private synthetic demo access, document QA and an isolated production-smoke clone. Never print or publish secrets. README documents safe provisioning and local seed behavior; the seed refuses cloud databases.

MongoDB Atlas plugin read access verified existing assignment/Cluster0, Free AWS Mumbai, MongoDB 8.0.34; no cloud mutations. Do not repurpose it without authorization. Shared engineering and six OpenCode Ponytail skill files are readable; OpenCode commands are not automatically registered here. Documents and in-app browser tools were used. DevTools MCP was not exposed; axe ran through the app's development-only helper. No new plugin is needed for local work.

## Next action and migration

Inspect actual status and finish any recorded uncommitted checkpoint before external actions. The immediate external blocker is approval of DEPLOYMENT plus the GitHub destination/Render account access. Do not interpret a generic continue as publishing approval. Native zoom/selected public-browser checks remain open; preserve that limitation until actually tested. After approval, provision only the named free resources, build a guarded isolated cloud acceptance harness, verify real Atlas transactions and public core flows/HTTPS, then update report/evidence. Finalize author fields and submit only when the owner provides the actual instructions and approval.

HANDOFF_PROMPT is a reusable routing prompt; this file, DECISIONS, tasks and evidence must be updated incrementally. A future chat should inspect them and current Git state, not restart completed work or assume a proposed action was approved.
