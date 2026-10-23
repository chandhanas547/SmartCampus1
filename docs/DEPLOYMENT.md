# LabFlow demonstration deployment

Updated 23 October 2026. **The synthetic demo is live at [labflow-lemon.vercel.app](https://labflow-lemon.vercel.app) on Vercel Hobby with Atlas Free.** The owner approved a public synthetic demonstration with zero cost, no card, no Pro trial and no automatic paid upgrade. The ICTAK guide section 13 asks for a working hosted URL, README live links and live core-flow evidence.

## Destinations and access

- Repository: [milan-kb/LabFlow](https://github.com/milan-kb/LabFlow), main branch, preserved M0 history. Original ICTAK references and all local secrets/data are excluded.
- Vercel: signed-in personal Hobby scope `mln15`. Project `labflow` (`prj_yGfZ8DDkbVQpyuwS3VTNBHVuX3A8`). The React build and Express API share the verified public HTTPS origin. Node 24 and the API function region `bom1` were confirmed from the provider.
- Atlas: separate project `labflow-capstone` (`6ada129837098679707baf8a`), Free cluster `labflow-demo`, AWS Mumbai (`AP_SOUTH_1`), MongoDB 8.0.34. The existing assignment project is untouched.
- `labflow_app` has readWrite only on `labflow`, scoped to this cluster. It connects and initializes identity/domain indexes successfully. Atlas's read outside that database returns error 8000; the scoped role was independently confirmed through the Atlas plugin.
- `labflow_verify` has readWrite/dbAdmin only on `labflow_acceptance_database`, `_identity` and `_domain`; it is never supplied to the web application. Private credentials remain outside Git.

On 23 October 2026 the owner explicitly approved the persistent `0.0.0.0/0` network rule for this demo project only, following automatic review's rejection of an earlier general instruction. The explicit rule is applied. It permits connection attempts from any IP, including to the isolated test databases; authentication, TLS and database roles still apply. This replaces the earlier Render host-IP-only plan. It is a synthetic-demo exception, not a real-student production baseline. Vercel's free function egress addresses change; its static IP feature is paid. See [Atlas/Vercel networking](https://www.mongodb.com/docs/atlas/reference/partner-integrations/vercel/) and [Vercel static IPs](https://vercel.com/docs/networking/static-ips).

## Build and runtime

`vercel.json` uses an unnamed API wildcard because Vercel forwards unused named rewrite captures into the query string; the original named route made strict health validation return 400. The corrected live route returns 200, and unknown query keys still return 400. It keeps the npm workspace root, installs with scripts disabled, runs `npm run build`, serves `client/dist` and routes `/api` to `api/index.js`. The adapter reuses one application/database pool per warm instance, shares concurrent cold initialization and retries after a failed startup. Sessions and authentication limits remain in MongoDB. Local startup still uses the original long-running Node entry. CDN security headers protect static responses; the API retains Helmet and strict request validation.

These variables are configured as private production environment values:

| Variable | Value/source |
|---|---|
| NODE_ENV | production |
| MONGODB_URI | Private app credential, dedicated labflow database, Atlas TLS |
| SESSION_SECRET | Independent private random value, at least 32 characters |
| APP_ORIGIN | https://labflow-lemon.vercel.app; exact origin, no trailing slash |
| TRUST_PROXY_HOPS | 1; secure cookies and rejection of forged-IP rate-limit evasion verified |
| NODEJS_HELPERS | 0, so Express owns JSON parsing and its 16 KiB body limit |

Node 24 is required by the workspace. Do not upload local `.env`, demo credentials, original DOCX files or `.local/`. `.vercelignore` explicitly excludes these. No native Atlas marketplace integration is needed; it would grant broader database roles. See [Vercel Node helpers](https://vercel.com/docs/functions/runtimes/node-js/advanced-node-configuration), [function request headers](https://vercel.com/docs/headers/request-headers) and [Express support](https://vercel.com/docs/frameworks/backend/express).

## Verification

- Local adapter increment: all 49 tests pass (16 server, five client API, 28 real MongoDB integration), lint and build pass. Two new tests verify shared cold initialization and safe recovery after failure.
- Cloud: all 28 real Atlas integration tests pass, including transactions, competing approvals, injected rollback, roles, ownership, secure session behavior and authentication limits. Cleanup inspection confirmed all three acceptance databases contain no collections. The first attempt before the network approval failed at connection setup and performed no fixture writes.
- Remote CI: [run for 9d23544](https://github.com/milan-kb/LabFlow/actions/runs/39902827649) passed checks, coverage gates and audit. That run includes the adapter but predates the one-line hosted routing correction.
- Hosted API/security: 14 initial checks and 22 domain checks pass. They cover secure host-only HttpOnly SameSite cookies, logout invalidation, exact-origin/custom-header CSRF, malformed JSON, the 16 KiB body limit, roles, ownership, cancellation, rejection and serviceable return. Forged forwarding/IP headers still reach the ten-attempt authentication limit; a further changed header receives 429 with Retry-After. Static security headers, deep-link refresh, missing-asset 404 and strict query rejection also pass.
- Hosted browser: admin inventory creation; student request; approval; issue; student damage; damaged return/report resolution; maintenance; restoration; dashboard; session reload; keyboard skip link; 320 CSS pixel dashboard without horizontal overflow. Screenshots and sanitized results are in `evidence/hosted/` and `evidence/hosted-acceptance.json`.
- One readiness request returned 503 during a refresh. UI retry recovered; ten subsequent sequential and five concurrent health requests returned 200. Provider request logs confirmed this isolated 503. Root cause was not established, so sustained availability and load performance are not claimed.
- Still unverified: native browser zoom, other browser engines, screen readers, sustained load, memory/CPU profiling and an executed rollback. These do not become passing checks merely because the site is reachable.

The owner explicitly approved creation of `admin@labflow.example` on 23 October 2026. It exists only as an application ADMIN in `labflow`; it has no Atlas/cloud administrator permission and did not elevate any existing user. Its random credential is in ignored owner-only `.local/cloud/demo-access.json`; synthetic student credentials are likewise private. No provisioning password was added to Git or the host environment. Deliver reviewer access privately through the owner's chosen channel. Never use local `seed:demo` against cloud or publish reusable passwords. Add synthetic inventory through the authenticated admin UI.

## Redeployment

The official Vercel CLI 65.2.0 is authenticated under ignored `.local/cloud/vercel-auth`. The local directory is linked to `mln15/labflow`; GitHub is not connected to Vercel, and pushes alone do not deploy. From the repository root, use the official CLI with `--global-config .local/cloud/vercel-auth --scope mln15`. Run `vercel deploy --dry --json` and inspect the file list first, then `vercel deploy --prod --yes`. Do not enable a Pro trial, Turbo build or paid add-on. The verified upload excluded original DOCX files, `.env.local`, local databases, credentials, tests and evidence. The current ignore rules preserve that boundary.

After deployment, inspect its ID/region, verify the ordinary public production alias without an authentication bypass, check `/api/health` returns 200 and `/api/health?unexpected=1` returns 400, and repeat affected core/session checks. The exact source/deployment records are in `evidence/hosted-acceptance.json`.

## Monitoring and rollback

Record the exact successful deployment ID and Git commit. Inspect health, safe errors, latency and memory during acceptance. A readiness/auth failure, allocation inconsistency or repeated 500 response stops evaluation. Use the Vercel Dashboard deployment history to select the last verified deployment and its rollback action, then repeat health/session/core-flow checks. The initial deployment with broken named rewrite routing is not a rollback candidate. Rollback has not been executed during this acceptance run. Preserve Atlas data/indexes; code rollback does not authorize deleting the database. If there is no successful hosted version, stop advertising the demo until fixed. Hobby usage exhaustion must pause the service rather than incur charges; no upgrade is authorized. See [Vercel account plans](https://vercel.com/docs/plans).

## Previous host attempt

Render workspace LabFlow (`tea-dbd4c5jrjlhs73d3k8l0`) exists on Hobby without a card. The API returned HTTP 402 and the Dashboard requested Add Card despite Free being selected. Setup was cancelled; no service/deployment or payment information was added. The old Render proposal is superseded by this runbook. SRS approval/submission and missing college metadata remain separate from deployment authorization.
