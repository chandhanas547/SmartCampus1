# LabFlow implementation contract details

22 October 2026. These bounded details implement the existing 19-endpoint SRS contract; document approval remains pending.

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

New request creation, manual maintenance and archive all write the same equipment document inside their transaction. This serializes the no-open-request guard against competing creation; a read-only count check alone is insufficient. Creation increments the equipment version even though it does not reserve it. Clients refresh after a version conflict. Mandatory damaged returns retain unrelated pending requests; restoration allows those pending requests.

Request replay compares normalized equipment ID, purpose and UTC requestedDueAt before enforcing a new request's future date. Identical retries return 200 even after the original date expires; changed payload with the same key returns 409. Only new requests return 201.

Screens show UTC instants in Asia/Kolkata. Datetime-local values are interpreted explicitly as Asia/Kolkata (UTC+05:30), independent of the browser's operating-system timezone.
