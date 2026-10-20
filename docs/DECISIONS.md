# LabFlow decisions and open questions

This document records the assumptions that future sessions must not silently change. Unconfirmed choices remain provisional until the SRS is approved.

## Accepted scope and constraints

- LabFlow is a **demo-only, single-lab MERN capstone**.
- Roles are `STUDENT` and `ADMIN`; public registration can create students only.
- Equipment is tracked as individual physical assets with unique asset tags.
- One borrowing request concerns one asset.
- The original ICTAK DOCX files stay local and unmodified but are excluded from Git.
- The SRS is a mandatory LMS submission and must be submitted before application coding.
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
| Server-side sessions in MongoDB | Proposed | Keeps authentication tokens out of browser-accessible storage and avoids another data service. Confirm in SRS. |
| Single-origin production deployment | Proposed | Simplifies cookies, CORS and deployment. Provider remains unselected. |
| JavaScript/JSX rather than TypeScript | Proposed | Minimizes capstone setup while retaining runtime schema validation. Confirm team preference. |

## Provisional policy choices

- Maximum lending period: **seven days from approval**. This is provisional pending laboratory/instructor confirmation.
- Pending requests do not reserve an asset; more than one student may have a pending request for it.
- A student may not have more than one active request for the same asset.
- Students may cancel pending or approved-but-unissued requests. Admin cancellation requires a reason.
- Uncollected approved requests require explicit cancellation; the MVP has no scheduled expiry worker.
- Only an admin records physical issue and return.
- Overdue is derived from an issued request whose due date has passed; it does not release the asset.
- Store timestamps in UTC. Display timezone is provisionally `Asia/Kolkata`.

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
| What LMS SRS template, deadline, filename and submission evidence are required? | Before M1 submission |
| Does the laboratory approve the seven-day lending rule and cancellation policy? | Before SRS approval |
| What fields establish a student identity for this demo? | Before identity implementation |
| JavaScript/JSX or TypeScript? | Before scaffolding |
| Exact session lifetime and password policy? | Before identity implementation |
| Which free hosting options are currently suitable, and is sleeping acceptable for evaluation? | Before deployment planning |
| What is the team size, ownership split and final deadline? | Before scheduling milestones |
| How will reviewers receive an admin demo account without exposing credentials? | Before final submission |

## Change rule

Update this document and the SRS before implementing a changed role, lifecycle rule, schema contract or security boundary. Record actual verification results only after running the relevant checks.
