# LabFlow

LabFlow is a demo-only, single-laboratory equipment management capstone. It will let students find individually tagged equipment, request borrowing, review request history and report damage. Lab administrators will manage inventory, decide requests, record issue and return, and monitor current activity.

## Planned stack

- MongoDB and Mongoose
- Express and Node.js
- React and Vite

The planned architecture is a React client communicating with an Express JSON API; only the API accesses MongoDB.

## Proposed MVP

### Student

- Register, sign in and sign out
- Browse a searchable, paginated equipment catalog
- Submit and cancel borrowing requests
- View request status and history
- Report damage for equipment currently issued to them

### Lab administrator

- Create, update, maintain and archive inventory records
- Approve or reject requests
- Record equipment issue and return
- Review damage reports and manage maintenance status
- View an operational dashboard

### Required qualities

- Server-enforced role and ownership checks
- Transaction-safe reservation, issue and return operations
- Validated API boundaries and consistent safe errors
- Responsive, keyboard-accessible user interface
- No secrets or real personal data in the repository or demonstration

## Current status

**Milestone M0 — repository setup.** The repository contains planning documentation only. No application has been scaffolded, no dependencies have been installed, and no test or deployment result is claimed.

An SRS submission is mandatory and must be completed before coding starts. See [`docs/MASTER_PLAN.md`](docs/MASTER_PLAN.md) and [`docs/DECISIONS.md`](docs/DECISIONS.md).

## Scope

This capstone is a demonstration for one laboratory with two roles: student and lab administrator. Multi-lab operation, payments, notifications, file uploads, QR scanning and advanced analytics are outside the MVP.

## Reference material

Two original ICTAK DOCX files remain in the local project root for reference. They are intentionally ignored by Git and are not part of the repository.
