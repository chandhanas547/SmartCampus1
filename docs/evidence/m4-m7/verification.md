# Inventory and circulation verification

22 October 2026; local development only. SRS approval/submission and deployment remain pending.

## Passing

- `npm run check`: lint, 12 server tests, five client tests, 23 integration tests and production build passed. Two additional domain cases then passed with the complete 25-case integration suite: 42 tests total across the current suites.
- Fourteen domain integration cases use MongoDB 8.0.34 as a real replica set: unique/immutable inventory, version conflicts, strict role/owner/input boundaries, archived visibility/history, idempotent concurrent replay, duplicate-open guards, simultaneous approvals, exact 168-hour dates, expired requests, approve/cancel races, report/return races, creation/archive/maintenance races, damaged return/restoration, nonzero dashboard/filter fixtures, and injected approval/return rollback.
- Injected collection validation failures deliberately return safe 500 responses and log only error name/code. Persisted request, equipment allocation, inspection and history remain unchanged after rollback.
- Earlier retry failures were traced to Mongoose attempting to reset an embedded `__v` that strict subdocuments did not define. Explicit unversioned embedded schemas retain optimistic concurrency on the parent request; race tests pass after the fix.
- Server coverage measured before the final two added tests: 98.43% lines, 89.93% branches, 98.75% functions. Circulation: 97.76% lines/88.66% branches; identity router: 100%/92%. This measurement covers imported server modules, not the process entry point or browser UI.
- Actual browser journey with synthetic local accounts: administrator sign-in, equipment creation/edit; student sign-in/request; administrator approval/issue; student damage report; administrator damaged inspection/return; maintenance restoration; dashboard reflecting seven available assets and zero open loans/reports.
- Catalog and dashboard at 320 CSS pixels: document scroll width 305, no horizontal overflow. Skip link activation focuses `main` without replacing the active route. Browser warning/error log empty after the workflow.
- Screenshots: `inspected-return.jpg`, `dashboard.jpg`, `dashboard-320.jpg`, `catalog-320.jpg`. These show genuine local synthetic records; no credentials.

## Remaining

Automated accessibility, full keyboard/200% zoom acceptance, production startup/fresh setup, performance measurements and final security review remain pending. CI has not run remotely; no hosted, college approval or submission result is claimed.
