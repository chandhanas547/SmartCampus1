# LabFlow

Live demonstration: [LabFlow](https://labflow-lemon.vercel.app) · [API readiness](https://labflow-lemon.vercel.app/api/health). Synthetic data only.

Source repository: [milan-kb/LabFlow](https://github.com/milan-kb/LabFlow).

LabFlow is a demo-only, single-laboratory equipment management capstone. Students find individually tagged equipment, request borrowing, review request history and report damage. Lab administrators manage inventory, decide requests, record issue and inspected return, and monitor current activity.

## Stack

- MongoDB and Mongoose
- Express and Node.js
- React and Vite

The architecture is a React client communicating with an Express JSON API; only the API accesses MongoDB.

## Capabilities

### Student

- Register, sign in and sign out
- Browse a searchable, paginated equipment catalog
- Select equipment and purpose from dropdowns, or describe Other; cancel eligible borrowing requests
- View request status and history
- Report damage for equipment currently issued to them

### Lab administrator

- Create, update, maintain and archive inventory records
- Assign an available registered asset for an unlisted need, then approve; or reject requests
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

**The synthetic demo is live on Vercel Hobby with Atlas Free.** The 25 October release includes the owner's UI redesign, equipment/purpose dropdowns with Other and atomic admin assignment. All 53 local tests, lint/build, critical coverage gates and the dependency audit pass; all 32 isolated Atlas integration cases passed on 24 October. The redesigned request/assignment/issue/return journey passes locally. Public readiness, strict query rejection, protected API access, static/deep-link serving, student sign-in and dropdown rendering are verified. The owner chose to skip a fresh live borrowing write test; preceding hosted lifecycle evidence is historical. Native browser zoom and other-engine checks remain unverified. SRS approval and college submission remain pending.

The redesigned form has no axe violations or horizontal overflow at 320px; graph-paper backgrounds require manual contrast review, recorded in QUALITY. The locked parser was updated to body-parser 2.4.0 after the release audit identified GHSA-27r3-jxmh-p828. See [deployment status](docs/DEPLOYMENT.md) for the exact deployed source and evidence.

The owner authorized development on 21 October 2026 while SRS approval and submission remain pending. Scope and business rules are recorded in [decisions](docs/DECISIONS.md).

## Run locally

Use Node **24.21.0** and npm **11.19.0**. Install from the repository root:

```sh
npm ci --ignore-scripts
```

Install scripts are deliberately disabled. The first database start or integration test downloads the pinned MongoDB **8.0.34** binary from MongoDB's distribution service. Test commands explicitly prepare that binary once before parallel test files start. A supported OS and internet access are required for that first download. The Linux binary selection is Ubuntu 22.04; it was also verified on this development machine's CachyOS system. No system MongoDB installation, Docker or cloud account is required for local development.

Create an ignored `server/.env` using these **local-only, non-secret** settings:

```dotenv
NODE_ENV=development
HOST=127.0.0.1
PORT=3000
MONGODB_URI=mongodb://127.0.0.1:27017/labflow?replicaSet=labflow-dev
APP_ORIGIN=http://127.0.0.1:5173
```

Generate `SESSION_SECRET` with at least 32 random characters and add it to the ignored `server/.env` (for example, generate bytes with Node crypto without committing the value). `server/.env.example` lists variable names only. The example above is for the loopback development database; production credentials must come from the deployment platform.

Run these in three terminals, all from the repository root:

```sh
npm run db
npm run dev:server
npm run dev:client
```

Open **http://127.0.0.1:5173/**. The API is at **http://127.0.0.1:3000/api/health**. Stop each process with Ctrl+C.

Development data persists in ignored `.local/mongodb/`; binary downloads are cached in `.local/mongodb-binaries/`. Integration tests use a separate temporary database. The loopback database has no authentication and is for synthetic local demo data only; never expose it to a network.

The client uses relative `/api` requests. Vite proxies them to port 3000 during development, and Express serves the build in production. If changing the API port, set `API_PROXY_TARGET` when starting the Vite process. Keep `APP_ORIGIN` equal to the exact browser origin used for mutations.

## Verify

```sh
npm test
npm run test:integration
npm run lint
npm run build
```

Or run `npm run check` for all four. `npm test` covers API/configuration/static-serving behavior and the client API module; integration tests prove transaction commit and rollback on a real replica set. The client tests use a dedicated process with Node's test isolation disabled to ensure all five cases are individually executed and reported on the pinned runtime.

`npm run test:cloud` reuses all 32 integration cases against the approved Atlas cluster. It requires ignored `.local/cloud/acceptance.env` with a dedicated `MONGODB_ACCEPTANCE_URI` targeting `/labflow_acceptance`. The command accepts only three isolated databases (`labflow_acceptance_database`, `_identity`, `_domain`), refuses non-empty databases, and removes only its own test collections afterward. Keep the verification user restricted to those databases; never provide the app database URI. Local checks always use temporary loopback databases.

`npm run test:coverage` enforces the existing 80% line/branch target for auth, ownership and circulation. Accessibility tooling, local performance measurement and the scope of these checks are documented in [the quality baseline](docs/QUALITY.md).

The [GitHub Actions run for deployed source `684af3c`](https://github.com/milan-kb/LabFlow/actions/runs/40130494194) passed checks, coverage gates and audit. The workflow runs on pushes and pull requests. Current local verification is summarized below; older milestone records remain available in Git history.

## Production shape

Run `npm run build`, provide valid runtime configuration, then run `npm start` with `NODE_ENV=production`. Production requires an explicit HTTPS `APP_ORIGIN`, a transaction-capable MongoDB URI and an appropriate `HOST` (usually `0.0.0.0` on a managed host). HTTPS terminates at the selected host/reverse proxy; the application process listens over HTTP behind it. Vercel Hobby is selected with Atlas Free for the synthetic demo. All 32 isolated cloud acceptance cases passed on 24 October, and their test databases were empty after cleanup. The public demo is [labflow-lemon.vercel.app](https://labflow-lemon.vercel.app), with the API function and database in Mumbai. Public HTTPS, secure cookies, CSRF, strict parsing, role/ownership restrictions and both return paths were verified on 23 October 2026. The local app configuration remains local. See [deployment status](docs/DEPLOYMENT.md).

## Scope

This capstone is a demonstration for one laboratory with two roles: student and lab administrator. Multi-lab operation, payments, notifications, file uploads, QR scanning and advanced analytics are outside the MVP.

## Reference material

Two original ICTAK DOCX files remain in the local project root for reference. They are intentionally ignored by Git and are not part of the repository.

## Administrator provisioning

Set `ADMIN_NAME`, `ADMIN_EMAIL` and a strong `ADMIN_PASSWORD` in ignored runtime configuration, then run `npm run admin`. The command refuses to elevate an existing account and never prints credentials. Remove the admin password from local configuration after provisioning. Public registration creates students only. `TRUST_PROXY_HOPS` defaults to `0`; set it to `1` only behind the verified single proxy selected for deployment. Identity implementation parameters are in `docs/SECURITY.md`.

For synthetic **local development only**, run `npm run seed:demo` with the local database running. This creates two demo accounts and six example assets without overwriting existing inventory. Random account passwords are saved only in ignored `.local/demo-access.json` with owner-only file permissions. Repeated runs reuse those accounts. Never publish that file or use this seed command against a cloud database.

## Verification and remaining release work

The current local review passes 53 tests (16 server, five client API and 32 real database integration tests), lint and the production build. Tests cover authentication, ownership, concurrent allocation, rollback, strict inputs and administrator-only borrower contacts. Dashboard counts open filtered lists; damaged returns require an inspection note. The dropdown flow and the owner's redesigned screens were browser-checked with synthetic accounts through return. Critical coverage is 99.05% lines and 92.58% branches; the unchanged 80% gates pass. The preceding dependency audit found zero vulnerabilities; this update adds no dependency. Accessibility scope and manual-review findings are recorded in [QUALITY](docs/QUALITY.md).

Report illustrations and local performance/production measurements are in `docs/evidence/`. Old milestone logs, handoff prompts and temporary review files were removed; their history is preserved in Git. The maintained regression suite and developer accessibility helper remain available to verify fixes.

Remaining before assessment:

- Review the [deployment evidence and operating limits](docs/DEPLOYMENT.md). The public demo satisfies the hosted-URL/core-flow checklist items; one transient readiness error recovered and is documented, without claiming an availability guarantee.
- Complete native browser zoom and the selected browser checks; in-app scans and CSS enlargement have narrower scope.
- Review the current [SRS](docs/SRS_DRAFT.md), [report source](docs/REPORT_DRAFT.md) and [submission checklist](docs/SUBMISSION.md). Personalized Word/PDF review copies are generated in ignored `.local/submission/`; student identifiers must not enter the public repository. Approval and submission remain pending.
- Author/student identifiers and institution are populated privately. Mentor and LMS filename, format, deadline and procedure remain unknown from the two supplied ICTAK references. Submission requires explicit authorization and a real receipt.
