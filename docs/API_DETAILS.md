# LabFlow implementation contract details

24 October 2026. These bounded details implement the existing 19-endpoint SRS contract; document approval remains pending.

| Input | Bound |
|---|---|
| Asset tag | 2–40 trimmed uppercase letters/digits, dot, underscore or hyphen; starts with a letter/digit; immutable |
| Name | 2–120 trimmed characters |
| Category | 2–80 trimmed characters |
| Location | 2–120 trimmed characters |
| Description and condition note | At most 2,000 trimmed characters |
| Purpose | 10–500 trimmed characters |
| Required reason, inspection/transition note, damage description | 1–2,000 non-whitespace characters |
| Request key | Client-generated UUID; scoped uniquely to the authenticated student |
| Dates | ISO 8601 instants with explicit offset; UTC normalized; future/168-hour checks use server time |
| Search | At most 80 trimmed characters; treated as literal text, never executable regex/operators |
| Pagination | Page 1–10,000; limit 1–50, default 20; stable createdAt/id sorting |

All writable bodies and query objects reject unknown fields. Equipment lists accept search/category/status/page/limit. Request lists accept status/page/limit; administrators may additionally use overdue=true/false and damage=true/false. Student lists remain ownership scoped. Administrator request lists/details additionally include `borrower: { name, email }` for physical handover, or null if the account is unavailable; student responses never include this contact field. Contacts are fetched in one bounded query per page, and password fields are excluded. Invalid identifiers use 400; missing/inaccessible records use 404; duplicate/stale/state conflicts use 409.

Return `condition` is the explicit inspection result. When a damage report exists, the server stores that same result with reviewer/time and requires a non-empty inspection note, even when condition is SERVICEABLE.

Registered-asset request creation, manual maintenance and archive all write the same equipment document inside their transaction. This serializes the no-open-request guard against competing creation; a read-only count check alone is insufficient. Registered-asset creation increments the equipment version even though it does not reserve it. Unlisted creation has no asset to update; assignment and reservation later share the equipment write in the approval transaction. Clients refresh after a version conflict. Mandatory damaged returns retain unrelated pending requests; restoration allows those pending requests.

Request replay compares the original normalized equipment ID or requestedEquipment description, purpose and UTC requestedDueAt before enforcing a new request's future date. Identical retries return 200 even after assignment or after the original date expires; changed payload with the same key returns 409. Only new requests return 201.

Screens show UTC instants in Asia/Kolkata. Datetime-local values are interpreted explicitly as Asia/Kolkata (UTC+05:30), independent of the browser's operating-system timezone.

## Unlisted equipment requests

`POST /api/requests` accepts exactly one of `equipmentId` (registered available asset) or `requestedEquipment` (10–500 trimmed characters), together with the unchanged purpose/date/requestKey fields. Both or neither, unknown keys and invalid descriptions return 400. Unlisted creation does not create inventory or reserve anything. One unassigned open request per student is allowed; duplicates return 409. Idempotent replay compares the original requested description even after assignment.

`POST /api/requests/:id/decision` APPROVE additionally accepts `equipmentId` for an unassigned request and requires it in that case. Assignment, actual asset snapshot, approval, reservation and event are one transaction. The asset must be AVAILABLE and the student must have no other open request for it. A tracked request cannot be redirected to a different asset. Missing assignment is 400; unavailable/competing/open-request conflicts are 409. REJECT and owner cancellation work without an asset. Issue, return and report guards remain unchanged. No index migration or extra endpoint is needed.
