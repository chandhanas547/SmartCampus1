# LabFlow takeover and SRS readiness review

Inspection date: 20 October 2026. This is an evidence record, not SRS approval or submission.

## Verified local state

- Workspace: `/home/milan/Projects/capstone`. Local reads and creation of these planning files succeed.
- Branch: `main`; single existing commit `8b85cf247813ba8342a98d9a4c27e4f5871dc1ac` (`docs: establish LabFlow project foundation`).
- Existing changes on arrival: modified `docs/DECISIONS.md`, untracked `docs/SRS_DRAFT.md`. Preserve both.
- No configured Git remote. No application scaffold, dependency manifest, test suite or deployment evidence exists.
- Node `v24.21.0`, npm `11.19.0`, Git and Python are executable. These are observed local versions, not selected project versions.
- `docker` and `mongod` were not found on PATH. This does not prove no database exists elsewhere; database connectivity and transaction support remain unverified.
- Browser inventory exposes an in-app browser and MCP Apps, both with no open tabs at inspection. Native desktop app control is disabled in this session. Chrome DevTools MCP is not exposed.
- Bundled document runtime is available. Both DOCX bodies were read, including table text. Original references are preserved.
- Package-registry access, Git hosting authorization, hosting accounts and LMS access have not been tested. No credentials were requested or inspected.
- Write access is scoped to the project, designated visualization workspace and temporary files; reading a home-directory skill does not imply unrestricted write access to the laptop.

## Installed skills

`/home/milan/.agents/skills` contains 26 readable engineering skill files, including planning, Git workflow, incremental implementation, testing, security, accessibility/UI and review guidance. These skills are also listed in this session's available-skill catalog. The skill-discovery and planning instructions were read and used in this handover.

`/home/milan/.config/opencode/skills` contains six additional readable skills: `ponytail`, `ponytail-audit`, `ponytail-debt`, `ponytail-gain`, `ponytail-help` and `ponytail-review`. Their headers were inspected. The OpenCode-level `AGENTS.md` was also readable. `/home/milan/.opencode` and the OpenCode executable exist.

These are accessible Markdown instructions that can be read and applied when relevant. The six OpenCode-specific skills are not listed as automatically registered skills in this session; filesystem readability alone does not prove automatic command registration or access to tools those skills may require. No copying, installation or OpenCode execution is needed to use the shared engineering guidance already available here.

## Reference findings

`MERN_Stack_Project_Guidelines_Student_Reference.docx` describes MERN separation, MVP planning, wireframes, API/data design, validation, authentication/ownership, Git history, tests, deployment and final evidence. Its final checklist requires an accessible repository, working hosted application, complete README, key/mobile screenshots, live core-flow checks, safe environment examples and honest limitations.

`Summer Internship Report __ React.docx` is a final internship-report template, not an SRS template. It requires executive summary, introduction, objectives, scope and deliverables, methodology, project activities, results and findings, conclusion and appendix. Its team-name labels and sample `XX.05.2023` date are placeholders, not facts about this submission.

Neither reference supplies this project's SRS deadline, filename, separate LMS procedure or submission receipt. The separate SRS-before-coding rule appears in the existing project documents. The owner has now confirmed that these two references are all known guidance and this is an individual submission.

## SRS review

Revision 0.2 is explicitly Draft, not approved or submitted. It contains 13 numbered sections, 11 functional requirements, 29 nonfunctional requirements, 10 use cases and 19 API endpoints.

The substantive clarified rules are consistent across the reviewed SRS sections: open requests include pending/approved/issued; manual maintenance/archive guards differ from mandatory damaged return; unrelated pending requests survive that return; restoration is allowed; approval uses a 168-hour upper bound; expired reservations cannot be issued; archived assets disappear from student discovery while history remains; return resolves existing damage reports.

Remaining preparation work:

1. Change team-oriented metadata to a single author; leave actual name, student ID, institution and mentor unknown until supplied. Do not reuse template names/dates or infer authorship from the operating-system username.
2. Synchronize MASTER_PLAN's old provisional policy/language/identity wording and blockers with DECISIONS and SRS 0.2. The existing supersession note prevents an immediate contradiction, but a submission package should not require readers to reconcile stale wording.
3. Add wireframes, including mobile layouts and navigation. They are required by the master plan's M1 deliverables and reference planning checklist but are absent from the current repository.
4. Complete field bounds and optionality before boundary schemas are built. Asset tag/category/location/request key/reason/note/search bounds and exact admin queue filters are not fully specified.
5. Clarify return payload wording: F9 calls for an explicit matching inspection result, while the endpoint lists `condition` and `inspectionNote`. Recommend using the submitted condition as the explicit inspection result, with the server recording that same value in the report; state this directly in the contract.
6. Resolve technical proposals before their implementation: password/hash parameters, session lifetime/store, origin/CSRF mechanism and rate limits. Record a researched proposal for review rather than asking the owner to select cryptographic parameters.
7. Finalize draft text limits, critical-code coverage and accessibility/browser targets. Performance measurement and broader browser checks remain scheduled for M8 as the SRS already specifies.
8. Prepare and visually check the SRS export. No mandatory export format is known, so do not claim a particular format is accepted by the institution.
9. Record document approval and actual submission separately. Neither is evidenced yet. Coding remains behind the existing M1 gate unless the owner explicitly changes that constraint.

No application behavior, race test, coverage, build or live deployment has been verified because application code does not yet exist.

## Original reference fingerprints

SHA-256 at handover:

| File | SHA-256 |
|---|---|
| MERN_Stack_Project_Guidelines_Student_Reference.docx | `8be79424d86ca1105196676b56e3b4fc2d2000cb01485fe95e2b4f05e74a18b1` |
| Summer Internship Report __ React.docx | `192f563bee16a0853fffd4924524d666cdc678b6d8aa346fc65eb22a51f5fb90` |

The README, MASTER_PLAN, DECISIONS and SRS were also fingerprinted before this handover's additions so their existing contents can be checked for accidental changes.

## Verification results

- PASS: all six pre-existing project/reference file fingerprints remain unchanged.
- PASS: Git HEAD remains the original M0 commit; no commit, branch change, push or history rewrite occurred.
- PASS: 13 numbered sections, F1–F11 each defined once, 29 unique NFR definitions in Section 5, 10 use cases and 19 endpoints matching MASTER_PLAN.
- The first NFR counting check also counted the repeated privacy entry in the verification matrix. Restricting the check to the definition section confirmed 29; no SRS correction was needed.
- PASS: both original DOCX files remain ignored by Git.
- PASS: both references rendered using the bundled document runtime: 15 guide pages and 3 report-template pages. Page overviews were visually inspected and content was read from the documents. This is reference inspection, not certification of a new submission artifact.
- PASS: `git diff --check`; separate whitespace check for the three new Markdown files.
- NOT RUN: application tests/build/deployment; no application exists yet.
- Added only `tasks/plan.md`, `tasks/todo.md` and this review. Existing uncommitted work remains uncommitted.

The proposed execution sequence is in [tasks/plan.md](../tasks/plan.md), with actionable acceptance and verification steps in [tasks/todo.md](../tasks/todo.md).
