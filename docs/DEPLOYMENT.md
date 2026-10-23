# LabFlow demonstration deployment

Updated 23 October 2026. **Vercel Hobby and Atlas Free are selected; no hosted URL is claimed yet.** The owner approved a public synthetic demonstration with zero cost, no card, no Pro trial and no automatic paid upgrade. The ICTAK guide section 13 asks for a working hosted URL, README live links and live core-flow evidence.

## Destinations and access

- Repository: [milan-kb/LabFlow](https://github.com/milan-kb/LabFlow), main branch, preserved M0 history. Original ICTAK references and all local secrets/data are excluded.
- Vercel: signed-in personal Hobby scope `mln15`. Project creation/publication remains pending. The React build and Express API must share one HTTPS origin.
- Atlas: separate project `labflow-capstone` (`6ada129837098679707baf8a`), Free cluster `labflow-demo`, AWS Mumbai (`AP_SOUTH_1`), MongoDB 8.0.34. The existing assignment project is untouched.
- `labflow_app` has readWrite only on `labflow`, scoped to this cluster. It connects and initializes identity/domain indexes successfully. Atlas's read outside that database returns error 8000; the scoped role was independently confirmed through the Atlas plugin.
- `labflow_verify` has readWrite/dbAdmin only on `labflow_acceptance_database`, `_identity` and `_domain`; it is never supplied to the web application. Private credentials remain outside Git.

On 23 October 2026 the owner explicitly approved the persistent `0.0.0.0/0` network rule for this demo project only, following automatic review's rejection of an earlier general instruction. The explicit rule is applied. It permits connection attempts from any IP, including to the isolated test databases; authentication, TLS and database roles still apply. This replaces the earlier Render host-IP-only plan. It is a synthetic-demo exception, not a real-student production baseline. Vercel's free function egress addresses change; its static IP feature is paid. See [Atlas/Vercel networking](https://www.mongodb.com/docs/atlas/reference/partner-integrations/vercel/) and [Vercel static IPs](https://vercel.com/docs/networking/static-ips).

## Build and runtime

`vercel.json` keeps the npm workspace root, installs with scripts disabled, runs `npm run build`, serves `client/dist` and routes `/api` to `api/index.js`. The adapter reuses one application/database pool per warm instance, shares concurrent cold initialization and retries after a failed startup. Sessions and authentication limits remain in MongoDB. Local startup still uses the original long-running Node entry. CDN security headers protect static responses; the API retains Helmet and strict request validation.

Set these variables in Vercel for the intended production environment before deploying:

| Variable | Value/source |
|---|---|
| NODE_ENV | production |
| MONGODB_URI | Private app credential, dedicated labflow database, Atlas TLS |
| SESSION_SECRET | Independent private random value, at least 32 characters |
| APP_ORIGIN | Exact assigned HTTPS production origin; no path/trailing slash |
| TRUST_PROXY_HOPS | 1, then verify live cookies and spoofed-IP behavior |
| NODEJS_HELPERS | 0, so Express owns JSON parsing and its 16 KiB body limit |

Node 24 is required by the workspace. Do not upload local `.env`, demo credentials, original DOCX files or `.local/`. `.vercelignore` explicitly excludes these. No native Atlas marketplace integration is needed; it would grant broader database roles. See [Vercel Node helpers](https://vercel.com/docs/functions/runtimes/node-js/advanced-node-configuration), [function request headers](https://vercel.com/docs/headers/request-headers) and [Express support](https://vercel.com/docs/frameworks/backend/express).

## Verification

- Local adapter increment: all 49 tests pass (16 server, five client API, 28 real MongoDB integration), lint and build pass. Two new tests verify shared cold initialization and safe recovery after failure.
- Cloud: all 28 real Atlas integration tests pass, including transactions, competing approvals, injected rollback, roles, ownership, secure session behavior and authentication limits. Cleanup inspection confirmed all three acceptance databases contain no collections. The first attempt before the network approval failed at connection setup and performed no fixture writes.
- Remote CI: [run for bac83f0](https://github.com/milan-kb/LabFlow/actions/runs/39823154784) passed. That run predates the Vercel adapter; do not claim CI for the unpushed increment.
- Still pending: Vercel configuration/build validation, public HTTPS, actual deployed commit/URL, secure cookies behind Vercel, spoofed-forwarded-header limits, strict malformed/oversized JSON, public student/admin journey, SPA refresh, missing assets/API errors, mobile/keyboard/native zoom, live screenshots and provider metrics.

Provision only a synthetic reviewer administrator through the controlled local `npm run admin` command against the dedicated cloud database using ignored configuration. Remove the temporary provisioning password afterward; deliver access privately through the owner's chosen channel. Never use local `seed:demo` against cloud or publish reusable passwords. Add synthetic inventory through the authenticated admin UI.

## Monitoring and rollback

Record the exact successful deployment ID and Git commit. Inspect health, safe errors, latency and memory during acceptance. A readiness/auth failure, allocation inconsistency or repeated 500 response stops evaluation. Revert to the last verified Vercel deployment and repeat health/session/core-flow checks. Preserve Atlas data/indexes; code rollback does not authorize deleting the database. If there is no successful hosted version, stop advertising the demo until fixed. Hobby usage exhaustion must pause the service rather than incur charges; no upgrade is authorized. See [Vercel account plans](https://vercel.com/docs/plans).

## Previous host attempt

Render workspace LabFlow (`tea-dbd4c5jrjlhs73d3k8l0`) exists on Hobby without a card. The API returned HTTP 402 and the Dashboard requested Add Card despite Free being selected. Setup was cancelled; no service/deployment or payment information was added. The old Render proposal is superseded by this runbook. SRS approval/submission and missing college metadata remain separate from deployment authorization.
