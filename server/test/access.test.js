import assert from 'node:assert/strict';
import { test } from 'node:test';
import { requireRole, requireUser } from '../src/errors.js';

test('authentication and role guards distinguish missing authentication from wrong role', () => {
  assert.throws(() => requireUser({}, {}, () => {}), (error) => error.status === 401);
  assert.throws(() => requireRole('ADMIN')({ user: { role: 'STUDENT' } }, {}, () => {}), (error) => error.status === 403);
  let accepted = false;
  requireRole('ADMIN')({ user: { role: 'ADMIN' } }, {}, () => { accepted = true; });
  assert.equal(accepted, true);
});
