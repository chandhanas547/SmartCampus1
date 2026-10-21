# LabFlow work queue

Status on 20 October 2026: handover inspection complete; M1 not approved/submitted. This is the single task queue; MASTER_PLAN remains the milestone baseline.

Each row is an unchecked task with an acceptance condition, verification and dependency. The file areas are prospective, not existing application files. Split any row into smaller tasks before implementation if it exceeds about five files. Record actual commands and results as work finishes.

| Done | ID | Task and acceptance | Verification | Depends on | Likely file areas |
|---|---|---|---|---|---|
| [x] | H1 | Inspect repository, tools, local skills and both references without altering existing work. | Git state, file reads, runtime checks and original-file SHA-256 comparison; see SRS_REVIEW. | — | Planning/review documents only |
| [ ] | S1 | Adapt the SRS to individual authorship and synchronize finalized defaults across project docs. Unknown college fields remain explicit. | Review diff against revision 0.2; retain 13 sections, F1–F11, 29 NFRs, 10 use cases and 19 endpoints. | H1 | SRS, DECISIONS, MASTER_PLAN, README |
| [ ] | S2 | Specify bounded API input fields, filter semantics and the inspection-result payload consistently. | Cross-check entity/API/use-case/verification tables; no extra feature or endpoint. | S1 | SRS, DECISIONS |
| [ ] | S3 | Propose supported password/session/CSRF/rate-limit choices and testable quality thresholds. | Verify official documentation; distinguish accepted baseline from proposed parameters. | S2 | SRS, DECISIONS |
| [ ] | S4 | Add mobile/desktop wireframes and readable lifecycle/data diagrams covering all core screens and transitions. | Trace student/admin navigation and error states against F1–F11 and the permission table. | S2 | SRS supporting design document |
| [ ] | S5 | Export a reviewable SRS with individual author fields and clearly identified remaining blanks. | Render and inspect every page; no invented metadata, approvals or results. | S3, S4 | SRS export and review record |
| [ ] | G1 | Record owner SRS approval and submission evidence, or an explicit owner revision to the pre-coding gate. | Inspect exact approved revision and receipt/confirmation; approval alone is not submission. | S5 | SRS status, decisions |
| [ ] | B1 | Pin tool versions and establish server startup plus validated configuration and readiness. | Run startup/configuration/readiness checks; invalid configuration fails safely. | G1 | Root/server configuration and entry files |
| [ ] | B2 | Establish a real MongoDB replica set and focused transaction test harness. | Commit/rollback smoke test against the actual database; document setup. | B1 | Server database/test setup |
| [ ] | B3 | Establish React shell and centralized API/error handling. | Development startup and production build; safe API failure UI. | B1 | Client entry, layout and API module |
| [ ] | B4 | Add reproducible lint/test/build commands and CI definition. | Run configured commands; environment examples contain variable names only. | B2, B3 | Root scripts, CI, env examples, README |
| [ ] | I1 | Deliver student registration with normalized email, safe output and validated input. | Duplicate, invalid-input and role-injection API tests plus registration form flow. | B4 | User model, registration handler/schema/UI/test |
| [ ] | I2 | Deliver login, restored session and logout. | Credential rejection, session regeneration/expiry/logout, CSRF and rate-limit tests. | I1 | Session middleware, auth handler/UI/test |
| [ ] | I3 | Establish role/owner enforcement and controlled admin provisioning. | Wrong-role denial; no public admin creation; seed command handles credentials safely. | I2 | Authorization, admin setup, tests |
| [ ] | E1 | Deliver searchable paginated catalog/detail with archived exclusion. | Filters/page boundaries and student/admin visibility; keyboard/mobile review. | I3 | Equipment model, queries, catalog/detail UI, tests |
| [ ] | E2 | Deliver equipment creation and versioned metadata edits. | Unique immutable tags, field allowlist, stale version and archived-edit tests. | E1 | Equipment mutations, form and tests |
| [ ] | E3 | Deliver maintenance, restoration and archival guards. | State/note/open-request tests; extend with creation races when R1 exists. | E2 | Inventory service, action UI and tests |
| [ ] | R1 | Deliver idempotent request creation and owner-scoped history. | Replay including expired original date; changed replay conflict; duplicate-open and inventory races. | E3 | Request model/service, form/history UI, tests |
| [ ] | R2 | Deliver approval/rejection with atomic reservation and 168-hour limits. | Real simultaneous approvals and injected rollback; expired and exact-boundary cases. | R1 | Circulation service, decision UI and tests |
| [ ] | R3 | Deliver eligible cancellation with single reservation release. | Owner/admin policy, repeated/after-issue conflicts, approve-versus-cancel race. | R2 | Circulation service, cancellation UI and tests |
| [ ] | L1 | Deliver physical issue of an unexpired reservation. | Linked records transition together; expired dueAt and repeat issue fail safely. | R3 | Circulation service, issue UI and tests |
| [ ] | L2 | Deliver owner-only single damage report while issued. | Wrong-owner/state and duplicate report tests; student/admin display. | L1 | Damage service, report UI and tests |
| [ ] | L3 | Deliver inspected return, resolving reports and retaining unrelated pending requests. | Both return conditions, required notes, repeated return, report/return race and rollback. | L2 | Return service/form and tests |
| [ ] | D1 | Deliver dashboard from known fixture counts. | Counts including overdue and unreviewed damage; student denial and empty/error UI. | L3 | Dashboard query/UI/test |
| [ ] | U1 | Complete navigation, responsive states and core demonstration. | Browser journey, keyboard, 320px and 200% zoom; automated accessibility findings. | D1 | Shared UI, styles, E2E tests |
| [ ] | V1 | Complete regression/security review and approved coverage checks. | Run tests/lint/build; record failures, fixes and untested limitations honestly. | U1 | Tests, quality configuration, evidence |
| [ ] | V2 | Verify fresh setup and measure browser/performance behavior. | Clean setup from README; record tested browser versions and measured budgets. | V1 | README, verification record |
| [ ] | P1 | Prepare concrete hosting/repository release proposal. | Current provider limits, transaction support, cost, secrets, reviewer access and rollback reviewed. | V2 | Deployment runbook and release configuration |
| [ ] | G2 | Obtain approval for the named publishing destinations and any cost. | Owner authorization recorded before external publication. | P1 | Release record |
| [ ] | P2 | Deploy approved release and verify the live demonstration. | HTTPS, deep links, no localhost, live core flows and secret/artifact review. | G2 | Deployment evidence, README |
| [ ] | F1 | Write individual ICTAK report and collect genuine screenshots/results. | All template sections present; every outcome traceable to evidence; rendered pages checked. | P2 | Final report, screenshots and evidence index |
| [ ] | F2 | Prepare final submission package and submit only when authorized. | Reviewer repository/live access, final checklist and actual submission confirmation. | F1 | Submission manifest and evidence |

Checkpoints: M1 after S1–S5/G1; M2 after B1–B4; M3 after I1–I3; M4 after E1–E3; M5 after R1–R3; M6 after L1–L3; M7 after D1/U1; M8 after V1/V2; M9 after P1/G2/P2; M10 after F1/F2.

At each checkpoint, update the evidence record and report the result. Obtain user input only for unresolved requirements, necessary access or the explicit approval gates above; routine verification does not require repeated confirmation.
