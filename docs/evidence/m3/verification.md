# M3 identity verification

21 October 2026. `npm run check` passed: 12 fast API/config/access/static checks, 5 client API checks and 11 real-replica-set integration checks (3 foundation + 8 identity), followed by a successful production build. Lint passed without suppression.

Identity integration covers safe registration/hash storage, duplicate/invalid/operator/role input, login/restoration, session rotation and old-cookie rejection, logout, identical wrong/unknown credential errors, absolute expiry, Origin/custom-header rejection, the tenth/eleventh limit boundary, and controlled admin creation without elevating an existing student.

Browser verification passed: synthetic student registration and automatic login, reload session restoration, and sign-out back to the login form. Screenshot `student-session.jpg` shows the restored session without credentials. The local development servers had stopped between turns and were restarted after checking ports; no existing service was replaced.

Selected policies are in `docs/SECURITY.md`. No remote/production deployment, 80% coverage result or request-record ownership outcome is claimed yet. Request ownership will be tested when circulation exists.
