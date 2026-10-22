import assert from 'node:assert/strict';
import { after, afterEach, before, test } from 'node:test';
import { randomBytes } from 'node:crypto';
import { openTestDatabase } from '../database-fixture.js';
import { createApp } from '../../src/app.js';
import { prepareIdentity, SESSION_MS } from '../../src/identity/index.js';
import { userModel } from '../../src/identity/user.js';
import { createAdministrator } from '../../src/identity/admin.js';

let fixture, connection, server, base, student;
let clock = Date.now();
const password = randomBytes(24).toString('base64url');
const headers = { origin: 'http://localhost:5173', 'content-type': 'application/json', 'x-labflow-request': '1' };
const input = { name: 'Demo Borrower', email: 'borrower@example.test', password };
async function call(path, body, cookie, extra = {}) {
  return fetch(`${base}/api${path}`, { method: body === undefined ? 'GET' : 'POST', headers: { ...headers, ...(cookie ? { cookie } : {}), ...extra }, ...(body === undefined ? {} : { body: JSON.stringify(body) }) });
}
async function login() {
  const response = await call('/auth/login', { email: input.email, password });
  assert.equal(response.status, 200);
  return response.headers.get('set-cookie').split(';')[0];
}
before(async () => {
  fixture = await openTestDatabase('identity');
  connection = fixture.connection;
  await prepareIdentity(connection);
  server = createApp({ connection, sessionSecret: randomBytes(48).toString('hex'), now: () => clock, origin: headers.origin, checkDatabase: async () => {} }).listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  base = `http://127.0.0.1:${server.address().port}`;
});
afterEach(async () => connection.db.collection('authLimits').deleteMany({}));
after(async () => {
  if (server) await new Promise((resolve) => server.close(resolve));
  await fixture?.close();
});

test('registration normalizes email, hashes password and returns only safe fields', async () => {
  const response = await call('/auth/register', { ...input, email: ' Borrower@Example.Test ' });
  assert.equal(response.status, 201);
  student = (await response.json()).data;
  assert.deepEqual(Object.keys(student).sort(), ['email', 'id', 'name', 'role']);
  assert.equal(student.email, input.email);
  assert.equal(student.role, 'STUDENT');
  assert.equal(response.headers.get('set-cookie'), null);
  assert.equal((await userModel(connection).findById(student.id)).passwordHash, undefined);
  const row = await userModel(connection).findById(student.id).select('+passwordHash');
  assert.match(row.passwordHash, /^scrypt\$/);
  assert.equal(row.passwordHash.includes(password), false);
});

test('duplicates, role injection, operators and invalid values create no extra accounts', async () => {
  assert.equal((await call('/auth/register', input)).status, 409);
  for (const change of [{ role: 'ADMIN' }, { email: { $ne: null } }, { name: ' ' }, { password: 'short' }, { name: 'x'.repeat(121) }]) {
    assert.equal((await call('/auth/register', { ...input, ...change })).status, 400);
  }
  assert.equal(await userModel(connection).countDocuments(), 1);
});

test('login, session restoration, regeneration and logout invalidate old cookies', async () => {
  assert.equal((await call('/auth/me')).status, 401);
  const cookie = await login();
  assert.equal((await call('/auth/me', undefined, cookie)).status, 200);
  const response = await call('/auth/login', { email: input.email, password }, cookie);
  const newCookie = response.headers.get('set-cookie').split(';')[0];
  assert.notEqual(newCookie, cookie);
  assert.match(response.headers.get('set-cookie'), /HttpOnly/);
  assert.match(response.headers.get('set-cookie'), /SameSite=Lax/);
  assert.equal((await call('/auth/me', undefined, cookie)).status, 401);
  assert.equal((await call('/auth/logout', {}, newCookie)).status, 204);
  assert.equal((await call('/auth/me', undefined, newCookie)).status, 401);
});

test('wrong password and absent account have the same credential failure', async () => {
  const first = await call('/auth/login', { email: input.email, password: `${password}wrong` });
  const second = await call('/auth/login', { email: 'absent@example.test', password });
  assert.equal(first.status, 401);
  assert.equal(second.status, 401);
  assert.deepEqual(await first.json(), await second.json());
});

test('absolute session expiry is enforced independently of MongoDB TTL cleanup', async () => {
  const cookie = await login();
  clock += SESSION_MS;
  try { assert.equal((await call('/auth/me', undefined, cookie)).status, 401); }
  finally { clock = Date.now(); }
});

test('custom-header and origin CSRF checks protect login and logout', async () => {
  assert.equal((await call('/auth/login', { email: input.email, password }, undefined, { 'x-labflow-request': '' })).status, 403);
  assert.equal((await call('/auth/login', { email: input.email, password }, undefined, { origin: 'https://attacker.invalid' })).status, 403);
});

test('the eleventh auth attempt in a window is rate limited', async () => {
  for (let i = 0; i < 10; i += 1) assert.equal((await call('/auth/login', {})).status, 400);
  const response = await call('/auth/login', {});
  assert.equal(response.status, 429);
  assert.ok(Number(response.headers.get('retry-after')) > 0);
});

test('controlled provisioning creates an admin and never elevates an existing student', async () => {
  await assert.rejects(createAdministrator(connection, input), /no role was changed/);
  assert.equal((await userModel(connection).findById(student.id)).role, 'STUDENT');
  const admin = await createAdministrator(connection, { ...input, name: 'Demo Administrator', email: 'admin@example.test' });
  assert.equal(admin.role, 'ADMIN');
  assert.equal('passwordHash' in admin, false);
});

test('production secure cookies require explicit proxy trust and retain host-only session behavior', async () => {
  const origin = 'https://labflow.example.test';
  for (const trustProxyHops of [0, 1]) {
    const productionServer = createApp({ connection, sessionSecret: randomBytes(48).toString('hex'), production: true, origin, trustProxyHops, checkDatabase: async () => {} }).listen(0, '127.0.0.1');
    await new Promise((resolve) => productionServer.once('listening', resolve));
    const url = `http://127.0.0.1:${productionServer.address().port}`;
    const proxyHeaders = { ...headers, origin, 'x-forwarded-proto': 'https' };
    try {
      const response = await fetch(`${url}/api/auth/login`, { method: 'POST', headers: proxyHeaders, body: JSON.stringify({ email: input.email, password }) });
      assert.equal(response.status, 200);
      const rawCookie = response.headers.get('set-cookie');
      if (!trustProxyHops) { assert.equal(rawCookie, null); continue; }
      assert.match(rawCookie, /^__Host-labflow\.sid=/);
      for (const attribute of [/; Secure/, /; HttpOnly/, /; SameSite=Lax/, /; Path=\//]) assert.match(rawCookie, attribute);
      assert.doesNotMatch(rawCookie, /Domain=/i);
      const cookie = rawCookie.split(';')[0];
      assert.equal((await fetch(`${url}/api/auth/me`, { headers: { ...proxyHeaders, cookie } })).status, 200);
      assert.equal((await fetch(`${url}/api/auth/logout`, { method: 'POST', headers: { ...proxyHeaders, cookie }, body: '{}' })).status, 204);
      assert.equal((await fetch(`${url}/api/auth/me`, { headers: { ...proxyHeaders, cookie } })).status, 401);
    } finally { await new Promise((resolve) => productionServer.close(resolve)); }
  }
});
