# Local quality baseline

22 October 2026. Selected implementation baseline under the owner's development authorization; formal SRS approval remains pending. Existing draft targets are retained, not lowered to accommodate results.

- Every increment: zero lint/build errors; all regression and real replica-set tests pass. No skipped tests, assertion removal or warning suppressions to obtain a pass.
- Critical auth/ownership/circulation: at least 80% aggregate line and branch coverage, enforced by `npm run test:coverage`. Included paths are domain, identity and role guards. This does not claim coverage of the browser or process lifecycle.
- Core screens: zero serious/critical axe findings; keyboard operation, 320 CSS pixels and 200% content enlargement checked separately. Automated scans do not establish complete WCAG conformance.
- Runtime: growing lists default 20/max 50; safe errors; uncertain mutations refresh authoritative state; no automatic mutation retries.
- M8 local performance target: warm sequential paginated reads and dashboard p95 below 250ms on the documented synthetic dataset; login sample below 2s. Measure via `npm run measure:local` after `npm run seed:demo`; respect auth limits. This small loopback benchmark is not a hosted SLO or load test. Keep initial client JS below 100KiB gzip and CSS below 20KiB uncompressed; production build reports actual sizes.
- Browser evidence currently comes from the in-app browser. Record its user agent; other engines and native browser zoom remain separate unverified matrix items.

Sources consulted: [Node coverage thresholds](https://nodejs.org/learn/test-runner/collecting-code-coverage), [axe API](https://github.com/dequelabs/axe-core/blob/develop/doc/API.md).

For a local axe run, open `http://127.0.0.1:5173/?audit` while Vite is running, navigate to a stable screen and select **Run accessibility check**. The development-only helper prints rule IDs/severity/targets without form values. Its optional content zoom uses CSS zoom; it is not evidence of native browser zoom. Vite removes this helper from production builds. Preserve incomplete/manual-review findings alongside violations.

## Dropdown and owner redesign verification 25 October 2026

The existing 53-case check, lint/build and 80% critical coverage gates pass (99.05% lines, 92.58% branches). All 32 isolated Atlas cases passed on 24 October and cleanup confirmed zero collections in each test database. No new dependencies or lowered gates.

The in-app browser (Chrome 155 on Linux) verified Other equipment/purpose, required descriptions, custom-purpose retention, keyboard selection, custom inventory metadata retention, admin asset creation/assignment, approval, issue and inspected return; ordinary registered-asset creation/cancellation also passed. The owner's subsequent visual redesign was separately checked through unlisted creation/assignment/issue/return. At 320px the redesigned borrowing form had zero axe violations and content width 305px with a 320px viewport. The invalid ARIA label on the generic pagination container was fixed using a navigation landmark. Axe retains a color-contrast incomplete result for text over the graph-paper gradient and decorative status symbols; this is not recorded as an automated pass. Accent and placeholder colors were darkened after manual token-ratio checks. Full native zoom, screen readers, other engines and more-than-50-asset dropdown pagination remain unverified. Screenshots in evidence distinguish the earlier form from the owner redesign.
