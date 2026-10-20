# LabFlow master plan

## 1. Purpose and authority

LabFlow is a demo-only MERN capstone for managing equipment in one college laboratory. Students request individually tagged assets; lab administrators control inventory and the physical borrowing lifecycle.

The two local ICTAK documents are authoritative project references. Their required final package includes an accessible repository, working hosted application, complete README, key/mobile screenshots, live core-flow evidence, safe environment examples, clean secret handling, meaningful history, and honest limitations. The internship report must cover its prescribed sections and make only evidence-backed claims.

An **SRS submission is mandatory per the LMS screenshot** and is scheduled before coding. The screenshot/template, exact deadline and submission procedure are not currently stored in this repository and must be confirmed during M1.

## 2. MVP boundary

### Roles

- **Student:** register, authenticate, browse equipment, request one asset, cancel an eligible request, see own history, and report damage for an issued asset they own.
- **Lab administrator:** authenticate, manage assets, decide requests, record issue/return, review damage, manage maintenance and view operational summaries.

Public registration never assigns the admin role. Admin provisioning must be controlled outside the public API.

### Included

- Individually tagged equipment and availability states
- Registration, login, logout and session expiry
- Searchable, filtered and paginated catalog
- Borrowing requests, history, approval/rejection and cancellation
- Physical issue and return
- Text-based damage reporting and inspection notes
- Inventory create/update/maintenance/archive operations
- Admin dashboard
- Secure RBAC, ownership checks, transactional consistency and accessible responsive UI

### Excluded

- Multiple laboratories, quantity requests, booking calendars and renewals
- SSO, notifications and self-service password recovery
- QR scanning, uploads, fines, payments and repair procurement
- Advanced analytics and real-time updates

Advanced performance, backup/restore and complete cross-browser gates are deferred until the core MVP works. Essential transaction, security, accessibility and core-flow checks are not deferred.

## 3. Architecture

```text
Browser / React UI
        |
        | HTTPS JSON requests
        v
Express / Node.js API
        |
        | Mongoose queries and transactions
        v
MongoDB replica set
```

Only the API accesses MongoDB. Proposed repository areas are `client/`, `server/`, `e2e/` and `docs/`. HTTP calls are centralized in one frontend API module. Routes remain thin; shared borrowing transitions belong in one circulation service. No generic repository layer, microservice, queue, Redis or state-management library is planned.

Logical capability order:

| Capability | Responsibility | Depends on |
|---|---|---|
| `identity` | Accounts, sessions, roles and ownership enforcement | — |
| `inventory` | Asset records, catalog and condition state | `identity` |
| `circulation` | Requests, reservations, issue, return and damage | `identity`, `inventory` |
| `dashboard` | Read-only operational summaries | All above |

The proposed production shape is one Node service serving the built React application and `/api`, backed by managed MongoDB. Provider selection is deferred; no paid service may be used without approval.

## 4. Borrowing rules

- One request targets one asset.
- Pending requests do not reserve equipment; approval does.
- Several students may have pending requests for the same available asset.
- A student cannot have multiple active requests for the same asset.
- Approval confirms the due date and atomically reserves the asset.
- The proposed maximum loan is **seven days from approval**, pending confirmation in M1.
- Students may cancel pending or approved-but-unissued requests. An admin may cancel an approved reservation with a reason.
- Only an admin records physical issue and return.
- Overdue means `ISSUED` with a past due date; overdue status never releases inventory.
- Uncollected reservations are explicitly cancelled; the MVP has no background expiry worker.
- A serviceable return makes an asset available. A damaged return places it in maintenance.
- Historical requests are retained when equipment is archived.

## 5. Lifecycle state transitions

| Action | Request before → after | Equipment before → after |
|---|---|---|
| Submit | New → `PENDING` | No change (`AVAILABLE`) |
| Approve | `PENDING` → `APPROVED` | `AVAILABLE` → `RESERVED` |
| Reject | `PENDING` → `REJECTED` | No change |
| Cancel pending | `PENDING` → `CANCELLED` | No change |
| Cancel approved | `APPROVED` → `CANCELLED` | `RESERVED` → `AVAILABLE` |
| Issue | `APPROVED` → `ISSUED` | `RESERVED` → `ISSUED` |
| Return serviceable | `ISSUED` → `RETURNED` | `ISSUED` → `AVAILABLE` |
| Return damaged | `ISSUED` → `RETURNED` | `ISSUED` → `MAINTENANCE` |

Inventory permits `AVAILABLE ↔ MAINTENANCE` with an admin reason. Archive is allowed only when no open request exists.

## 6. Functional requirements and acceptance criteria

| ID | Requirement | Acceptance criteria |
|---|---|---|
| F1 | Student registration and authentication | Valid registration succeeds; normalized duplicate email returns `409`; invalid input saves nothing; client-supplied admin role is rejected; credentials and hashes never appear in responses. |
| F2 | Access control | Protected unauthenticated requests return `401`; students calling admin actions receive `403`; another student's request is not disclosed; logout and expiry invalidate access. |
| F3 | Equipment discovery | Search/filter results are paginated; asset tag and current state are visible; loading, empty and failure states are usable. |
| F4 | Inventory management | Create/edit validates fields and unique tags; stale edits return `409`; archive preserves history and rejects an asset with an open request. |
| F5 | Borrowing request and history | A request uses the authenticated student and valid asset/input; duplicate active requests are prevented; history shows decisions and timestamps. |
| F6 | Approval/rejection | Approval reserves exactly one asset; rejection requires a reason; simultaneous approvals produce one winner and one conflict without partial updates. |
| F7 | Cancellation | An eligible cancellation releases a reservation exactly once; cancellation after issue fails without altering inventory. |
| F8 | Issue and return | Issue requires an approved request; return requires an issued request; repeated return cannot release twice; damaged return enters maintenance. |
| F9 | Damage report | Only the owner of an issued request can report damage; at most one report exists per borrowing; the admin can review it and records inspection findings at return. |
| F10 | Admin dashboard | Inventory counts, pending requests, issued/overdue loans and unreviewed damage reports agree with known database fixtures. |
| F11 | Accessible responsive operation | Core flows work at 320px and desktop widths, by keyboard, with labels, visible focus, associated errors and status not conveyed by colour alone. |

Primary demonstration: register → browse → request → approve → issue → report damage → return as damaged → restore from maintenance.

## 7. Data model

All domain documents use ObjectIds and timestamps.

### `users`

- `name`
- normalized unique `email`
- excluded-by-default `passwordHash`
- `role`: `STUDENT | ADMIN`

### `equipment`

- immutable normalized unique `assetTag`
- `name`, `category`, `description`, `location`
- `status`: `AVAILABLE | RESERVED | ISSUED | MAINTENANCE | ARCHIVED`
- nullable `currentRequestId`
- `conditionNote`, `updatedBy`
- numeric optimistic `version`

### `requests`

- `studentId` reference
- `equipmentId` reference
- immutable asset tag/name snapshot for retained history
- client-stable `requestKey`
- `purpose`, `requestedDueAt`, approved `dueAt`
- `status`: `PENDING | APPROVED | REJECTED | CANCELLED | ISSUED | RETURNED`
- `issuedAt`, `returnedAt`, `returnCondition`, `inspectionNote`
- embedded lifecycle events: action, actor, timestamp, optional reason
- optional embedded damage report: description, reporter/time, reviewer/time and inspection result

### `sessions`

Managed by the selected MongoDB session store with bounded expiry.

### Required constraints and indexes

- Unique normalized email and asset tag
- Unique `(studentId, requestKey)` for safe creation retries
- Partial unique `(studentId, equipmentId)` for active statuses
- Partial unique `equipmentId` for `APPROVED`/`ISSUED`
- Query indexes for student history, status/date, overdue and equipment filters
- Bounded strings, strict enums, valid dates/identifiers and allowlisted update fields

Inventory invariants:

1. `RESERVED` points to one `APPROVED` request.
2. `ISSUED` points to one `ISSUED` request.
3. Other asset states have no allocation pointer.
4. No asset has two approved/issued requests.
5. Request and equipment lifecycle updates commit together.

## 8. API contract

Prefix all endpoints with `/api`. Success uses `{ "data": ... }`; lists include `pagination`. Errors use `{ "error": { "code", "message", "fields"? } }`. Dates are ISO 8601. Default page size is 20 and maximum is 50.

| Method and path | Access | Purpose |
|---|---|---|
| `POST /api/auth/register` | Public | Register a student |
| `POST /api/auth/login` | Public | Start a session |
| `POST /api/auth/logout` | Authenticated | Destroy the session |
| `GET /api/auth/me` | Authenticated | Read the current safe user |
| `GET /api/equipment` | Authenticated | Search/filter/paginate catalog |
| `GET /api/equipment/:id` | Authenticated | Read asset details |
| `POST /api/equipment` | Admin | Create an asset |
| `PATCH /api/equipment/:id` | Admin | Update allowlisted fields with expected version |
| `DELETE /api/equipment/:id` | Admin | Archive an eligible asset |
| `POST /api/requests` | Student | Create an idempotent borrowing request |
| `GET /api/requests` | Authenticated | List own requests or admin-scoped queue |
| `GET /api/requests/:id` | Owner/admin | Read request and timeline |
| `POST /api/requests/:id/decision` | Admin | Approve with due date or reject with reason |
| `POST /api/requests/:id/cancellation` | Owner/admin | Cancel an eligible request |
| `POST /api/requests/:id/issue` | Admin | Record handover |
| `POST /api/requests/:id/return` | Admin | Record condition, inspection and return |
| `POST /api/requests/:id/damage-report` | Owner | Create one damage report for an issued asset |
| `GET /api/dashboard` | Admin | Read operational summaries |
| `GET /api/health` | Public | Minimal readiness status |

Expected errors: `400` invalid input/ID, `401` unauthenticated, `403` forbidden, `404` absent or inaccessible, `409` duplicate/stale/invalid transition, `413` too large, `415` unsupported content, `429` rate limited, and safe `500`/`503` responses.

The same request key and identical creation payload returns the existing request; reuse with different input conflicts. After an uncertain mutation timeout, clients reload state before allowing another action.

## 9. Security and concurrency requirements

- Strong password hashing; exact algorithm parameters and password/session policy are finalized in the SRS.
- Server-side sessions with production `HttpOnly`, `Secure`, host-only and appropriate `SameSite` cookies.
- Regenerate at login and destroy at logout.
- Derive role and ownership from server-controlled records.
- Scope student queries by authenticated user ID; never accept ownership from request bodies.
- Validate bodies, parameters, queries, headers and environment at trust boundaries.
- Allowlist writable fields; prevent NoSQL operator injection and mass assignment.
- JSON-only mutations, bounded body/search sizes, restrictive security headers and safe centralized errors.
- Restrict browser origins and protect cookie-authenticated mutations against CSRF.
- Rate-limit authentication endpoints without logging credentials or session values.

Approval, cancellation, issue, return, maintenance/archive and competing request creation use MongoDB transactions plus conditional state filters. Unique indexes are the final duplicate guard. A state mismatch returns `409`; a failed multi-document operation rolls back completely.

Required race/edge tests include double submission, simultaneous approvals, approve-versus-cancel, repeated return, report-versus-return, failure between writes, archive/maintenance-versus-request creation, stale catalog state, expired due date and unknown network outcome.

## 10. UI screens

- Public: registration and login
- Student: catalog, asset/request form, request history and request timeline/damage form
- Admin: dashboard, inventory list/create/edit, request queue and request decision/issue/return detail
- Shared: navigation, session-expired, access-denied and not-found handling

Each data screen needs loading, success, empty and retryable-error states. Forms retain recoverable input, show associated validation errors, disable during submission and announce outcomes accessibly.

## 11. Verification baseline

Before a feature milestone is complete:

- Its F1–F11 acceptance criteria pass at API/database/UI level as applicable.
- Transaction race tests use a real replica-set database.
- No role, ownership, validation or secret-handling regression exists.
- Production build and lint checks pass once those commands exist.
- Core user flows remain keyboard-usable and responsive.
- Documentation and evidence describe actual results only.

Initial target for auth/ownership/circulation code is at least 80% line and branch coverage, subject to approval in M1. Advanced load budgets, backup restoration and full Chromium/Firefox/WebKit gates are deliberately deferred until the core MVP works; their eventual thresholds must be measured rather than claimed now.

## 12. Milestones

| ID | Scope | Completion gate |
|---|---|---|
| M0 | Initialize Git; ignore references/secrets/artifacts; record README, master plan and decisions. | Reviewed staged snapshot, secret check and initial commit when identity is configured. |
| M1 | Confirm policies; produce and submit mandatory SRS with wireframes, state/data diagrams and API contract. | User approval plus LMS submission evidence. **No coding before this gate.** |
| M2 | Pin tools; scaffold client/server; configure database, validation, errors, API client and basic CI/tests. | Both apps run locally; build and transaction smoke check pass; setup/env docs work. |
| M3 | Deliver registration, sessions, logout, RBAC, ownership and controlled admin provisioning. | F1–F2 and negative security cases pass. |
| M4 | Deliver inventory management and searchable/paginated catalog. | F3–F4, index checks and basic responsive/keyboard checks pass. |
| M5 | Deliver request, history, decisions, cancellation and transactional reservation. | F5–F7 and real simultaneous approval/rollback tests pass. |
| M6 | Deliver issue, return, damage, inspection and maintenance restoration. | F8–F9, repeated-return and report/return race tests pass. |
| M7 | Deliver dashboard, role navigation and complete loading/empty/error UX. | F10–F11 and the primary end-to-end demonstration pass locally. |
| M8 | Run core regression, security and accessibility verification; then establish advanced gates if useful. | Approved constraints pass; defects and limitations are recorded honestly. |
| M9 | Deploy an approved commit using no paid service without approval; configure HTTPS and secrets. | Live core flows, deep links and browser network/secret checks pass. |
| M10 | Complete ICTAK report, README, screenshots, self-review and submission package. | Fresh-clone check and ICTAK final checklist pass; reviewer access confirmed. |

Each milestone ends with evidence, updated documentation and a focused commit. Do not mark future milestones complete based on plans.

## 13. Documentation deliverables

- M1: approved/submitted SRS, wireframes, state/data diagrams and testable requirement matrix
- M2 onward: environment examples, setup instructions and evolving API/test evidence
- M5–M7: concurrency results, demo script and synthetic screenshots
- M8–M9: test/defect report, deployment runbook and live verification record
- M10: final README and internship report sections—executive summary, introduction, objectives, scope/deliverables, methodology, activities, results/findings, conclusion and appendix

## 14. Current blockers

M1 needs the LMS SRS instructions/screenshot details, due date, approved lending policy, team schedule, identity fields and language choice. Hosting is intentionally unresolved and must remain free unless paid use is explicitly approved.
