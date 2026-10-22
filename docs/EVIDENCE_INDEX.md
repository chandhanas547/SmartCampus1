# LabFlow evidence index

Updated 22 October 2026. Evidence is local unless explicitly stated otherwise.

| Checkpoint | Evidence | Scope |
|---|---|---|
| Takeover/M1 | `SRS_REVIEW.md`, `SRS_READINESS.md`, SRS 0.4 export | References preserved; individual draft synchronized; 23 rendered pages reviewed; not approved/submitted |
| M2 foundation | `evidence/m2/verification.md` and screenshots | Startup, readiness, transaction harness, responsive shell and build |
| M3 identity | `evidence/m3/verification.md`, student-session screenshot | Registration/login/session restore/logout, boundaries and controlled admin setup |
| M4–M6 inventory/circulation | `evidence/m4-m7/verification.md` and screenshots | Real database races/faults and actual browser request/issue/damage/inspection/restore |
| M7/M8 quality | `evidence/m8/verification.md`, `axe-*.json`, `browser.json` | 44 tests, coverage gates, keyboard/reflow, automated scans and explicit browser limits |
| M8 performance | `evidence/m8/performance.json` | 30 warm sequential local samples per read endpoint and one login sample |
| M8 production shape | `evidence/m8/production-smoke.json` | Pruned production process, hidden checkout/deep links/assets and simulated HTTPS proxy sessions |
| M8 artifacts/history | `evidence/m8/artifact-scan.json` | Known local random-secret values absent; M0 ancestry preserved |
| M9 preparation | `DEPLOYMENT.md`, root `render.yaml` | Concrete proposal only; no cloud changes/publication |
| M10 preparation | `REPORT_DRAFT.md` | Nine ICTAK report sections with genuine local results; final live results/metadata pending |

Required remaining evidence includes native browser zoom, selected public-browser acceptance, remote CI, actual HTTPS/cloud transaction/core-flow checks, reviewer access and the real approval/submission record. CSS content enlargement and local database mocks are not substitutes; no database mock was used for the recorded concurrency checks.
