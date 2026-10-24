# Changelog

## Dropdowns and owner redesign 2026-10-25

- Added equipment and purpose dropdowns with required Other descriptions, plus preset/custom inventory metadata choices.
- Added unlisted requests without a reservation; admin approval assigns and reserves a real available asset atomically, retaining the original description.
- Preserved the owner's instrument-register visual redesign; corrected production font loading, pagination semantics and low-contrast accent/placeholder colors.
- Verified 53 local tests and all 32 isolated Atlas integration cases, including assignment races and rollback. Local browser verification passes through inspected return; see the deployment runbook for current publication evidence.

## Hosted demonstration 2026-10-23

- Published the synthetic MERN demonstration on Vercel Hobby with Atlas Free, without a card or paid resource.
- Verified live borrowing, both return paths, damage resolution, restoration, cancellation, rejection and access restrictions.
- Fixed Vercel rewrite query pollution while retaining strict input validation.
- Added public verification evidence and refreshed the SRS/report review copies.
- SRS approval and college submission remain pending; see the deployment runbook for limitations.

## Unreleased

- Student registration, sign-in, restored sessions and logout with controlled administrator provisioning.
- Searchable inventory with immutable tags, versioned metadata, maintenance, restoration and archival.
- Borrowing requests with replay protection, decisions, cancellations, physical issue, damage reports and inspected return.
- Transactional allocation, role/ownership enforcement, strict validation, bounded authentication and safe errors.
- Responsive student/admin screens, personal history, request timelines and operational dashboard with working filtered links.
- Administrator-only borrower contacts for handover, required damaged-return notes and inline archive confirmation.
- Real MongoDB concurrency/fault tests, accessibility evidence, coverage gates, clean-setup and production-process verification.
- SRS review export, design/API/security documents, report draft and a proposed free release configuration.

This entry describes local work. A hosted release/version will be recorded only after publishing approval and live acceptance.
