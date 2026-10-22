# LabFlow

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

**Core application locally verified; release preparation is ready for review.** Identity, inventory, decisions/cancellation, issue, damage, inspected return, maintenance and dashboard are implemented. All 47 tests, lint/build and the 80% critical coverage gates pass; real browser and production-process evidence is recorded. Native browser zoom and public deployment acceptance remain open. No hosted application or submission is claimed.

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

`npm run test:cloud` reuses all 28 integration cases against the approved Atlas cluster. It requires ignored `.local/cloud/acceptance.env` with a dedicated `MONGODB_ACCEPTANCE_URI` targeting `/labflow_acceptance`. The command accepts only three isolated databases (`labflow_acceptance_database`, `_identity`, `_domain`), refuses non-empty databases, and removes only its own test collections afterward. Keep the verification user restricted to those databases; never provide the app database URI. Local checks always use temporary loopback databases.

`npm run test:coverage` enforces the existing 80% line/branch target for auth, ownership and circulation. Accessibility tooling, local performance measurement and the scope of these checks are documented in [the quality baseline](docs/QUALITY.md).

The initial GitHub Actions run passed for `80582af`. A GitHub Actions workflow runs the same checks plus an audit on pushes and pull requests. Check [Actions](https://github.com/milan-kb/LabFlow/actions) for remote results; the local verification below does not claim a GitHub CI result. Current verification is summarized below; older milestone records remain available in Git history.

## Production shape

Run `npm run build`, provide valid runtime configuration, then run `npm start` with `NODE_ENV=production`. Production requires an explicit HTTPS `APP_ORIGIN`, a transaction-capable MongoDB URI and an appropriate `HOST` (usually `0.0.0.0` on a managed host). HTTPS terminates at the selected host/reverse proxy; the application process listens over HTTP behind it. The owner approved the zero-cost Render/Atlas deployment and public synthetic demonstration on 22 October 2026; setup and hosted verification are in progress. Repository publishing to `milan-kb/LabFlow` was authorized separately.

## Scope

This capstone is a demonstration for one laboratory with two roles: student and lab administrator. Multi-lab operation, payments, notifications, file uploads, QR scanning and advanced analytics are outside the MVP.

## Reference material

Two original ICTAK DOCX files remain in the local project root for reference. They are intentionally ignored by Git and are not part of the repository.

## Administrator provisioning

Set `ADMIN_NAME`, `ADMIN_EMAIL` and a strong `ADMIN_PASSWORD` in ignored runtime configuration, then run `npm run admin`. The command refuses to elevate an existing account and never prints credentials. Remove the admin password from local configuration after provisioning. Public registration creates students only. `TRUST_PROXY_HOPS` defaults to `0`; set it to `1` only behind the verified single proxy selected for deployment. Identity implementation parameters are in `docs/SECURITY.md`.

For synthetic **local development only**, run `npm run seed:demo` with the local database running. This creates two demo accounts and six example assets without overwriting existing inventory. Random account passwords are saved only in ignored `.local/demo-access.json` with owner-only file permissions. Repeated runs reuse those accounts. Never publish that file or use this seed command against a cloud database.

## Verification and remaining release work

The local review passes 47 tests (14 server, five client API and 28 real database integration tests), lint and the production build. Tests cover authentication, ownership, concurrent allocation, rollback, strict inputs and administrator-only borrower contacts. Dashboard counts open filtered lists; damaged returns require an inspection note. The browser review checks these changes with synthetic accounts. Critical coverage is 99.41% lines and 92.66% branches; the unchanged 80% gates pass. The dependency audit found zero vulnerabilities. The updated return screen passed axe checks at 1280px and 320px with no findings or horizontal overflow; the equipment archive disclosure also passed and supports keyboard cancellation. Full accessibility scope is recorded in [QUALITY](docs/QUALITY.md).

Report illustrations and local performance/production measurements are in `docs/evidence/`. Old milestone logs, handoff prompts and temporary review files were removed; their history is preserved in Git. The maintained regression suite and developer accessibility helper remain available to verify fixes.

Remaining before assessment:

- Complete the approved [deployment](docs/DEPLOYMENT.md), then verify real HTTPS, cloud transactions and the public student/admin journey.
- Complete native browser zoom and the selected browser checks; in-app scans and CSS enlargement have narrower scope.
- Review the [SRS DOCX](docs/exports/LabFlow_SRS_DRAFT_0.4.docx) and [report draft](docs/REPORT_DRAFT.md). The SRS is a 23-page review export, not approved or submitted. Its source is [SRS_DRAFT](docs/SRS_DRAFT.md); regeneration requires rendering and inspecting every page.
- Fill individual author/student ID, institution/mentor if required; confirm LMS filename, format, deadline and procedure. These details are unknown from the two supplied ICTAK references. Submission requires explicit authorization and a real receipt.
