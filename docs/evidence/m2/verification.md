# M2 foundation verification

Implementation commit: `8b9f079` on `codex/m2-foundation`.

Verified locally on 21 October 2026 using Node 24.21.0 and npm 11.19.0 on CachyOS Linux. These are executed local checks, not deployment or academic submission evidence.

| Check | Result |
|---|---|
| `npm ci --ignore-scripts --offline --cache=/tmp/labflow-npm-cache` | Passed using the previously populated npm cache: 216 packages installed. The ordinary fresh-machine command is `npm ci --ignore-scripts` and needs registry access. |
| `npm test` | Passed: 11 API/config/static-serving cases and 5 client API cases. |
| `npm run test:integration` | Passed both before and after clean reinstall: 3 cases against real MongoDB 8.0.34 replica set, including commit, rollback after an injected failure and disconnected readiness. |
| `npm run lint` | Passed with zero errors or warnings after fixing the caught-error cause. |
| `npm run build` | Passed: Vite production build; main JavaScript approximately 225 kB, 70.6 kB gzip. This is an artifact size, not a performance benchmark. |
| `npm audit --audit-level=high` | Passed after installation: zero known vulnerabilities reported. |
| `git diff --check` | Passed; repeated with the final documentation before committing. |
| Browser startup | React → Express → real local MongoDB readiness displayed “Connected to LabFlow.” |
| Retry | Button entered disabled “Checking connection…” state, then returned to connected. |
| Browser console | No captured warning/error entries during the inspected startup. |
| 320px layout | No horizontal overflow: viewport width 320, document width 305 (vertical scrollbar present). Text and retry control remained visible. |
| Keyboard | First Tab after reload focused the visible skip-to-content link. Full core-flow keyboard/zoom checks await the actual features. |
| Screenshots | `desktop.jpg`, `mobile-320.jpg`, captured from the running application. |

The production static-serving tests verify deep links receive the SPA while unknown API paths and missing assets retain JSON 404s; they also verify production security headers. A separate actual production process on loopback port 3001 also passed readiness, deep-link, built-JavaScript and unknown-API checks. Production serving has not been deployed.

The original ICTAK reference SHA-256 hashes match the takeover record. M0 remains an ancestor of the development branch. Ignored status was checked for the local environment, database data and production build output.

## Dependency and database choices

- Dependency scripts are disabled in `.npmrc`; clean installation also explicitly used `--ignore-scripts`. The only lockfile entry with an install script was optional macOS `fsevents`, absent on this Linux install. No blanket rebuild/script approval was used.
- Tests and the local runner use `mongodb-memory-server-core`, which downloads and launches an actual MongoDB executable. It is not a simulated transaction implementation. The local runner persists data on loopback; integration databases are temporary.
- MongoDB is pinned to 8.0.34, the current 8.0 patch listed in the [official release notes](https://www.mongodb.com/docs/manual/release-notes/8.0/) during implementation. Binary cache is ignored `.local/mongodb-binaries`, outside `node_modules` so clean installs do not discard it.
- The [Mongoose transaction helper](https://mongoosejs.com/docs/transactions.html) was used for commit/rollback verification. Future domain race tests remain required in M5/M6.
- Express error handling follows the [Express 5 documentation](https://expressjs.com/en/guide/error-handling/); Vite proxy configuration follows the [official server options](https://vite.dev/config/server-options.html#server-proxy). The client effect cleans up cancellation as described by [React](https://react.dev/reference/react/useEffect).
- CI uses the currently documented actions from [checkout](https://github.com/actions/checkout) and [setup-node](https://github.com/actions/setup-node), with read-only repository permission.

## Remaining limits

No remote CI run, cloud database connection from the application, deployment, automated axe audit, full browser matrix, 200% zoom audit or lending/authentication behavior is claimed. The SRS remains a draft. Those checks are tracked in the work queue at their relevant milestones.
