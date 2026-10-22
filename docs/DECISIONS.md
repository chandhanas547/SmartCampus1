# LabFlow decisions and open questions

This document records the assumptions that future sessions must not silently change. Unconfirmed choices remain provisional until the SRS is approved.

## Accepted scope and constraints

- LabFlow is a **demo-only, single-lab MERN capstone**.
- Roles are `STUDENT` and `ADMIN`; public registration can create students only.
- Equipment is tracked as individual physical assets with unique asset tags.
- One borrowing request concerns one asset.
- The original ICTAK DOCX files stay local and unmodified but are excluded from Git.
- SRS approval and submission remain pending. On 21 October 2026 the owner instructed development to begin, superseding the earlier submission-before-coding gate.
- No paid service may be provisioned without explicit approval.
- No real personal data, secrets or reusable demonstration passwords belong in source, history or screenshots.
- Transactional inventory safety, server-side RBAC, ownership enforcement and input validation are MVP requirements, not polish.

## Architecture decisions

| Decision | Status | Reason |
|---|---|---|
| React client → Express JSON API → MongoDB | Accepted | Matches the required MERN architecture and keeps database access server-side. |
| One repository with separate `client` and `server` areas | Accepted | Simple student workflow and clear responsibility boundaries. |
| Individually tagged assets | Accepted | Makes availability, handover, return and damage history unambiguous. |
| Reserve equipment only when an admin approves | Accepted | Pending requests remain requests; conditional transactional approval chooses one winner. |
| MongoDB transactions plus unique/partial indexes | Accepted | Prevents partial lifecycle updates and simultaneous double approval. |
| Server-side sessions in MongoDB | Selected for implementation | Keeps authentication tokens out of browser-accessible storage and avoids another data service. Confirm in SRS. |
| Single-origin production deployment | Proposed | Simplifies cookies, CORS and deployment. A free Render/Atlas proposal is prepared; cloud deployment is not authorized. Repository publishing to `milan-kb/LabFlow` was authorized on 22 October 2026. |
| JavaScript/JSX rather than TypeScript | Accepted demo default | Finalized by the owner for this capstone; boundary validation remains mandatory. |

## Finalized demo policies

- Maximum lending period: **seven days (168 hours) from the server-recorded approval instant**. `requestedDueAt` must be future at creation and approval; approved `dueAt` must be future and within this limit. An admin may choose a different due date at approval, not at issue.
- Registration fields are `name`, `email` and `password` only; actual report authorship/institution metadata remains TBD.
- Pending requests do not reserve an asset; more than one student may have a pending request for it.
- A student may not have more than one active request for the same asset.
- Students may cancel pending or approved-but-unissued requests. Admin cancellation requires a reason.
- Uncollected approved requests require explicit cancellation; the MVP has no scheduled expiry worker.
- Only an admin records physical issue and return.
- Overdue is derived from an issued request whose due date has passed; it does not release the asset.
- Store timestamps in UTC and display in `Asia/Kolkata`.
- Open/active requests are `PENDING`, `APPROVED` and `ISSUED`. Manual entry into maintenance and archive are blocked by any open request.
- A damaged return must enter maintenance even with unrelated pending requests. Those requests remain pending without automatic rejection; restoration permits them, but approval requires availability and an unexpired requested date.
- Expired pending requests remain pending until explicitly rejected or cancelled. Expired approved reservations cannot be issued or extended; cancellation under the existing policy is required before a fresh request.
- Existing damage reports must be resolved at return with reviewer/time, matching inspection result and non-empty note, even for serviceable returns.
- Inventory PATCH uses expected version and one explicit action: metadata edit, enter maintenance or restore. Manual transition notes are mandatory; allocation states cannot be set through PATCH.

These policies supersede the older provisional labels in MASTER_PLAN. The detailed contract is in `SRS_DRAFT.md` revision 0.4 Draft and remains subject to document review; it is not evidence of SRS submission.

## Provisional implementation choices

- MongoDB-backed sessions are selected for implementation; single-origin operation is implemented. The free Render/Atlas proposal in `DEPLOYMENT.md` awaits approval.
- Identity implementation policies are recorded in `docs/SECURITY.md`: scrypt, eight-hour absolute MongoDB sessions, strict Origin/custom-header CSRF defense and MongoDB-backed authentication limits.
- Bounded inputs in `docs/API_DETAILS.md` and the unchanged 80% critical coverage target in `docs/QUALITY.md` are selected implementation baselines. Formal SRS approval remains pending; browser/zoom limits are reported explicitly.

## Deferred from MVP

- Multiple laboratories, departments or approval levels
- Quantity/basket requests and partial returns
- SSO, email verification and self-service password recovery
- Booking calendars, renewals and notifications
- QR scanning, file/image uploads, fines and payments
- Advanced analytics and exports
- Advanced performance budgets, backup/restore exercises and full cross-browser gates until the core MVP works

Deferral does not remove basic security, accessibility, responsive design, transaction tests or live core-flow verification.

## Unresolved decisions and blockers

| Question | Needed by |
|---|---|
| What LMS SRS template, deadline, filename and submission evidence are required? | Before SRS submission |
| Is the revised SRS transition/date/PATCH contract approved for submission? | Before SRS approval |
| Which free hosting options are currently suitable, and is sleeping acceptable for evaluation? | Before approving deployment |
| What are the individual author/student ID, institution/mentor and final deadline? | Before final submission |
| How will reviewers receive an admin demo account without exposing credentials? | Before final submission |

## Change rule

Update this document and the SRS before implementing a changed role, lifecycle rule, schema contract or security boundary. Record actual verification results only after running the relevant checks.
