import assert from 'node:assert/strict';
import { after, before, beforeEach, test } from 'node:test';
import { randomBytes, randomUUID } from 'node:crypto';
import { MongoMemoryReplSet } from 'mongodb-memory-server-core';
import { connectDatabase } from '../../src/database.js';
import { prepareIdentity } from '../../src/identity/index.js';
import { prepareDomain, domainModels } from '../../src/domain/models.js';
import { userModel } from '../../src/identity/user.js';
import { hashPassword } from '../../src/identity/password.js';
import { createApp } from '../../src/app.js';

let replica, connection, server, base, adminCookie, studentCookie, otherCookie;
let clock = Date.now();
let models;
const headers = { origin: 'http://localhost:5173', 'content-type': 'application/json', 'x-labflow-request': '1' };
const asset = { assetTag: 'LAB-001', name: 'Oscilloscope', category: 'Electronics', location: 'Lab A' };
async function call(method, path, body, cookie = adminCookie) {
  const response = await fetch(`${base}/api${path}`, { method, headers: { ...headers, ...(cookie ? { cookie } : {}) }, ...(body === undefined ? {} : { body: JSON.stringify(body) }) });
  return { status: response.status, body: response.status === 204 ? null : await response.json() };
}
async function createAsset(change = {}) {
  const result = await call('POST', '/equipment', { ...asset, ...change });
  assert.equal(result.status, 201);
  return result.body.data;
}
async function requestEquipment(equipmentId, cookie = studentCookie, change = {}) {
  return call('POST', '/requests', { equipmentId, purpose: 'A synthetic laboratory experiment', requestedDueAt: new Date(clock + 86400000).toISOString(), requestKey: randomUUID(), ...change }, cookie);
}
before(async () => {
  replica = await MongoMemoryReplSet.create({ replSet: { count: 1, ip: '127.0.0.1' } });
  connection = await connectDatabase(replica.getUri('domain_test'));
  await prepareIdentity(connection); await prepareDomain(connection);
  models = domainModels(connection);
  const password = randomBytes(24).toString('base64url');
  const passwordHash = await hashPassword(password);
  await userModel(connection).create([
    { name: 'Demo Admin', email: 'admin@example.test', passwordHash, role: 'ADMIN' },
    { name: 'Demo Student', email: 'student@example.test', passwordHash, role: 'STUDENT' },
    { name: 'Other Student', email: 'other@example.test', passwordHash, role: 'STUDENT' },
  ]);
  server = createApp({ connection, sessionSecret: randomBytes(48).toString('hex'), now: () => clock, origin: headers.origin, checkDatabase: async () => {} }).listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  base = `http://127.0.0.1:${server.address().port}`;
  const cookies = [];
  for (const email of ['admin@example.test', 'student@example.test', 'other@example.test']) {
    const response = await fetch(`${base}/api/auth/login`, { method: 'POST', headers, body: JSON.stringify({ email, password }) });
    assert.equal(response.status, 200);
    cookies.push(response.headers.get('set-cookie').split(';')[0]);
  }
  [adminCookie, studentCookie, otherCookie] = cookies;
});
beforeEach(async () => {
  clock = Date.now();
  await models.Equipment.deleteMany({});
  await models.BorrowingRequest.deleteMany({});
});
after(async () => {
  if (server) await new Promise((resolve) => server.close(resolve));
  await connection?.close(); await replica?.stop();
});

test('inventory enforces roles, unique tags, strict input and safe student discovery', async () => {
  assert.equal((await call('GET', '/equipment', undefined, null)).status, 401);
  assert.equal((await call('POST', '/equipment', asset, studentCookie)).status, 403);
  const row = await createAsset({ assetTag: ' lab-001 ' });
  assert.equal(row.assetTag, 'LAB-001');
  assert.equal((await call('POST', '/equipment', asset)).status, 409);
  assert.equal((await call('POST', '/equipment', { ...asset, status: 'ISSUED' })).status, 400);
  const list = await call('GET', '/equipment?search=scope&limit=1', undefined, studentCookie);
  assert.equal(list.body.data.length, 1);
  assert.equal(list.body.pagination.total, 1);
  assert.equal('currentRequestId' in list.body.data[0], false);
  assert.equal((await call('GET', '/equipment?limit=51', undefined, studentCookie)).status, 400);
  assert.equal((await call('GET', '/equipment/not-an-id', undefined, studentCookie)).status, 400);
  const literal = await call('GET', '/equipment?search=%5B', undefined, studentCookie);
  assert.equal(literal.status, 200);
  assert.equal(literal.body.pagination.total, 0);
});

test('inventory PATCH is versioned and maintenance/archive preserve visibility rules', async () => {
  let row = await createAsset();
  const patch = { action: 'EDIT_METADATA', version: row.version, name: 'Bench oscilloscope' };
  assert.equal((await call('PATCH', `/equipment/${row.id}`, { ...patch, assetTag: 'OTHER' })).status, 400);
  assert.equal((await call('PATCH', `/equipment/${row.id}`, { action: 'EDIT_METADATA', version: row.version })).status, 400);
  assert.equal((await call('PATCH', `/equipment/${row.id}`, patch)).status, 200);
  assert.equal((await call('PATCH', `/equipment/${row.id}`, patch)).status, 409);
  assert.equal((await call('PATCH', `/equipment/${row.id}`, { action: 'ENTER_MAINTENANCE', version: 1 })).status, 400);
  row = (await call('PATCH', `/equipment/${row.id}`, { action: 'ENTER_MAINTENANCE', version: 1, note: 'Inspection' })).body.data;
  assert.equal(row.status, 'MAINTENANCE');
  row = (await call('PATCH', `/equipment/${row.id}`, { action: 'RESTORE', version: row.version, note: 'Inspection complete' })).body.data;
  assert.equal(row.status, 'AVAILABLE');
  assert.equal((await call('DELETE', `/equipment/${row.id}`)).status, 204);
  assert.equal((await call('GET', `/equipment/${row.id}`, undefined, studentCookie)).status, 404);
  assert.equal((await call('GET', `/equipment/${row.id}`)).status, 200);
  const archived = (await call('GET', `/equipment/${row.id}`)).body.data;
  assert.equal((await call('PATCH', `/equipment/${row.id}`, { action: 'EDIT_METADATA', version: archived.version, name: 'Forbidden edit' })).status, 409);
  assert.equal((await requestEquipment(row.id)).status, 404);
  assert.equal((await call('GET', '/equipment', undefined, studentCookie)).body.pagination.total, 0);
});

test('request creation is idempotent under concurrent replay and remains replayable after expiry', async () => {
  const equipment = await createAsset();
  const values = { equipmentId: equipment.id.toUpperCase(), purpose: 'A synthetic laboratory experiment', requestedDueAt: new Date(clock + 60000).toISOString(), requestKey: randomUUID() };
  const results = await Promise.all([call('POST', '/requests', values, studentCookie), call('POST', '/requests', values, studentCookie)]);
  assert.deepEqual(results.map((row) => row.status).sort(), [200, 201]);
  assert.equal(results[0].body.data.id, results[1].body.data.id);
  clock += 120000;
  assert.equal((await call('POST', '/requests', values, studentCookie)).status, 200);
  assert.equal((await call('POST', '/requests', { ...values, purpose: 'Changed request purpose' }, studentCookie)).status, 409);
  assert.equal((await call('POST', '/requests', { ...values, requestKey: randomUUID() }, studentCookie)).status, 400);
});

test('open-request guards and ownership apply at the API boundary', async () => {
  const equipment = await createAsset();
  const request = await requestEquipment(equipment.id);
  assert.equal(request.status, 201);
  assert.equal((await requestEquipment(equipment.id)).status, 409);
  assert.equal((await call('GET', `/requests/${request.body.data.id}`, undefined, otherCookie)).status, 404);
  assert.equal((await call('GET', '/requests', undefined, otherCookie)).body.pagination.total, 0);
  assert.equal((await call('POST', `/requests/${request.body.data.id}/decision`, { action: 'REJECT', reason: 'Test' }, studentCookie)).status, 403);
  const current = (await call('GET', `/equipment/${equipment.id}`)).body.data;
  assert.equal((await call('PATCH', `/equipment/${equipment.id}`, { action: 'ENTER_MAINTENANCE', version: current.version, note: 'Inspection' })).status, 409);
  assert.equal((await call('DELETE', `/equipment/${equipment.id}`)).status, 409);
});

test('simultaneous approvals choose one winner with a matching allocation', async () => {
  const equipment = await createAsset();
  const first = (await requestEquipment(equipment.id)).body.data;
  const second = (await requestEquipment(equipment.id, otherCookie)).body.data;
  const approve = { action: 'APPROVE', dueAt: new Date(clock + 86400000).toISOString() };
  const results = await Promise.all([call('POST', `/requests/${first.id}/decision`, approve), call('POST', `/requests/${second.id}/decision`, approve)]);
  assert.deepEqual(results.map((row) => row.status).sort(), [200, 409]);
  const assetRow = await models.Equipment.findById(equipment.id);
  assert.equal(assetRow.status, 'RESERVED');
  assert.equal(await models.BorrowingRequest.countDocuments({ status: 'APPROVED' }), 1);
  assert.equal((await models.BorrowingRequest.findById(assetRow.currentRequestId)).status, 'APPROVED');
});

test('approval date boundaries and expired reservation issue restrictions are exact', async () => {
  const equipment = await createAsset();
  let request = (await requestEquipment(equipment.id)).body.data;
  assert.equal((await call('POST', `/requests/${request.id}/decision`, { action: 'APPROVE', dueAt: new Date(clock + 168 * 3600000 + 1).toISOString() })).status, 400);
  assert.equal((await call('POST', `/requests/${request.id}/decision`, { action: 'APPROVE', dueAt: new Date(clock + 168 * 3600000).toISOString() })).status, 200);
  assert.equal((await call('POST', `/requests/${request.id}/cancellation`, {}, studentCookie)).status, 200);
  request = (await requestEquipment(equipment.id)).body.data;
  assert.equal((await call('POST', `/requests/${request.id}/decision`, { action: 'APPROVE', dueAt: new Date(clock + 60000).toISOString() })).status, 200);
  clock += 120000;
  assert.equal((await call('POST', `/requests/${request.id}/issue`, {})).status, 409);
  assert.equal((await models.Equipment.findById(equipment.id)).status, 'RESERVED');
});

test('an injected request-write failure rolls back the earlier equipment reservation', async () => {
  const equipment = await createAsset();
  const request = (await requestEquipment(equipment.id)).body.data;
  await connection.db.command({ collMod: models.BorrowingRequest.collection.name, validator: { status: { $ne: 'APPROVED' } }, validationLevel: 'strict' });
  try {
    assert.equal((await call('POST', `/requests/${request.id}/decision`, { action: 'APPROVE', dueAt: new Date(clock + 86400000).toISOString() })).status, 500);
    const stored = await models.Equipment.findById(equipment.id);
    assert.equal(stored.status, 'AVAILABLE');
    assert.equal(stored.currentRequestId, null);
    assert.equal((await models.BorrowingRequest.findById(request.id)).status, 'PENDING');
  } finally { await connection.db.command({ collMod: models.BorrowingRequest.collection.name, validator: {} }); }
});

test('damaged return resolves reports and retains unrelated pending requests through restoration', async () => {
  const equipment = await createAsset();
  const request = (await requestEquipment(equipment.id)).body.data;
  const other = (await requestEquipment(equipment.id, otherCookie)).body.data;
  await call('POST', `/requests/${request.id}/decision`, { action: 'APPROVE', dueAt: new Date(clock + 86400000).toISOString() });
  assert.equal((await call('POST', `/requests/${request.id}/issue`, {})).status, 200);
  assert.equal((await call('POST', `/requests/${request.id}/damage-report`, { description: 'A connector is loose.' }, otherCookie)).status, 404);
  assert.equal((await call('POST', `/requests/${request.id}/damage-report`, { description: 'A connector is loose.' }, studentCookie)).status, 201);
  assert.equal((await call('POST', `/requests/${request.id}/damage-report`, { description: 'Duplicate report' }, studentCookie)).status, 409);
  assert.equal((await call('POST', `/requests/${request.id}/return`, { condition: 'SERVICEABLE' })).status, 400);
  const result = await call('POST', `/requests/${request.id}/return`, { condition: 'DAMAGED', inspectionNote: 'Connector requires inspection.' });
  assert.equal(result.status, 200);
  assert.equal(result.body.data.damageReport.inspectionResult, 'DAMAGED');
  assert.ok(result.body.data.damageReport.reviewedAt);
  assert.equal((await models.BorrowingRequest.findById(other.id)).status, 'PENDING');
  let stored = await models.Equipment.findById(equipment.id);
  assert.equal(stored.status, 'MAINTENANCE');
  assert.equal(stored.currentRequestId, null);
  assert.equal((await call('POST', `/requests/${request.id}/return`, { condition: 'SERVICEABLE' })).status, 409);
  const restored = await call('PATCH', `/equipment/${equipment.id}`, { action: 'RESTORE', version: stored.version, note: 'Connector inspected and repaired.' });
  assert.equal(restored.status, 200);
  assert.equal((await call('POST', `/requests/${other.id}/decision`, { action: 'APPROVE', dueAt: new Date(clock + 86400000).toISOString() })).status, 200);
});

test('creation versus archive/maintenance cannot leave an open request on a manually unavailable asset', async () => {
  for (const action of ['archive', 'maintenance']) {
    await models.Equipment.deleteMany({}); await models.BorrowingRequest.deleteMany({});
    const equipment = await createAsset();
    const mutation = action === 'archive' ? call('DELETE', `/equipment/${equipment.id}`) : call('PATCH', `/equipment/${equipment.id}`, { action: 'ENTER_MAINTENANCE', version: equipment.version, note: 'Inspection' });
    const results = await Promise.all([requestEquipment(equipment.id), mutation]);
    const row = await models.Equipment.findById(equipment.id);
    const open = await models.BorrowingRequest.countDocuments({ equipmentId: equipment.id, status: 'PENDING' });
    assert.equal(row.status === 'AVAILABLE' ? open : 0, open);
    assert.ok(results.some((result) => [200, 201, 204].includes(result.status)));
  }
});

test('approve versus cancel preserves a single release and terminal state', async () => {
  const equipment = await createAsset();
  const row = (await requestEquipment(equipment.id)).body.data;
  const results = await Promise.all([
    call('POST', `/requests/${row.id}/decision`, { action: 'APPROVE', dueAt: new Date(clock + 86400000).toISOString() }),
    call('POST', `/requests/${row.id}/cancellation`, {}, studentCookie),
  ]);
  assert.equal(results[1].status, 200);
  assert.ok([200, 409].includes(results[0].status));
  assert.equal((await models.BorrowingRequest.findById(row.id)).status, 'CANCELLED');
  const stored = await models.Equipment.findById(equipment.id);
  assert.equal(stored.status, 'AVAILABLE'); assert.equal(stored.currentRequestId, null);
  assert.equal((await call('POST', `/requests/${row.id}/cancellation`, {}, studentCookie)).status, 409);
});

test('report versus serviceable return cannot leave an unresolved report after return', async () => {
  const equipment = await createAsset();
  const row = (await requestEquipment(equipment.id)).body.data;
  await call('POST', `/requests/${row.id}/decision`, { action: 'APPROVE', dueAt: new Date(clock + 86400000).toISOString() });
  await call('POST', `/requests/${row.id}/issue`, {});
  const results = await Promise.all([
    call('POST', `/requests/${row.id}/damage-report`, { description: 'A possible loose connection.' }, studentCookie),
    call('POST', `/requests/${row.id}/return`, { condition: 'SERVICEABLE', inspectionNote: 'Connection checked and secure.' }),
  ]);
  assert.equal(results[1].status, 200);
  assert.ok([201, 409].includes(results[0].status));
  const stored = await models.BorrowingRequest.findById(row.id);
  assert.equal(stored.status, 'RETURNED');
  if (stored.damageReport) { assert.ok(stored.damageReport.reviewedAt); assert.equal(stored.damageReport.inspectionResult, 'SERVICEABLE'); }
  const dashboard = (await call('GET', '/dashboard')).body.data;
  assert.equal(dashboard.equipment.AVAILABLE, 1);
  assert.equal(dashboard.issued, 0); assert.equal(dashboard.pending, 0); assert.equal(dashboard.unreviewedDamage, 0);
  assert.equal((await call('GET', '/dashboard', undefined, studentCookie)).status, 403);
  assert.equal((await call('DELETE', `/equipment/${equipment.id}`)).status, 204);
  const history = await call('GET', `/requests/${row.id}`, undefined, studentCookie);
  assert.equal(history.status, 200); assert.equal(history.body.data.assetSnapshot.name, asset.name);
});

test('expired pending approval fails without mutation, and admin cancellation requires a reason', async () => {
  const equipment = await createAsset();
  const row = (await requestEquipment(equipment.id, studentCookie, { requestedDueAt: new Date(clock + 60000).toISOString() })).body.data;
  clock += 120000;
  assert.equal((await call('POST', `/requests/${row.id}/decision`, { action: 'APPROVE', dueAt: new Date(clock + 86400000).toISOString() })).status, 409);
  assert.equal((await models.BorrowingRequest.findById(row.id)).status, 'PENDING');
  assert.equal((await call('POST', `/requests/${row.id}/decision`, { action: 'REJECT', reason: 'Requested return date has passed.' })).status, 200);
  const fresh = (await requestEquipment(equipment.id)).body.data;
  await call('POST', `/requests/${fresh.id}/decision`, { action: 'APPROVE', dueAt: new Date(clock + 86400000).toISOString() });
  assert.equal((await call('POST', `/requests/${fresh.id}/cancellation`, {})).status, 400);
  assert.equal((await call('POST', `/requests/${fresh.id}/cancellation`, { reason: 'Pickup cancelled.' })).status, 200);
});

test('failed return rolls back release, inspection resolution and history together', async () => {
  const equipment = await createAsset();
  const row = (await requestEquipment(equipment.id)).body.data;
  await call('POST', `/requests/${row.id}/decision`, { action: 'APPROVE', dueAt: new Date(clock + 60000).toISOString() });
  await call('POST', `/requests/${row.id}/issue`, {});
  await call('POST', `/requests/${row.id}/damage-report`, { description: 'Loose connector.' }, studentCookie);
  await connection.db.command({ collMod: models.BorrowingRequest.collection.name, validator: { status: { $ne: 'RETURNED' } }, validationLevel: 'strict' });
  try {
    assert.equal((await call('POST', `/requests/${row.id}/return`, { condition: 'DAMAGED', inspectionNote: 'Repair required.' })).status, 500);
    const stored = await models.BorrowingRequest.findById(row.id);
    const assetRow = await models.Equipment.findById(equipment.id);
    assert.equal(stored.status, 'ISSUED');
    assert.equal(stored.damageReport.reviewedAt, undefined);
    assert.equal(stored.events.at(-1).action, 'REPORT');
    assert.equal(assetRow.status, 'ISSUED');
    assert.equal(assetRow.currentRequestId.toString(), row.id);
  } finally { await connection.db.command({ collMod: models.BorrowingRequest.collection.name, validator: {} }); }
});

test('dashboard and admin filters distinguish overdue, pending and unreviewed damage', async () => {
  const first = await createAsset();
  const second = await createAsset({ assetTag: 'LAB-002' });
  const issued = (await requestEquipment(first.id)).body.data;
  await requestEquipment(second.id, otherCookie);
  await call('POST', `/requests/${issued.id}/decision`, { action: 'APPROVE', dueAt: new Date(clock + 60000).toISOString() });
  await call('POST', `/requests/${issued.id}/issue`, {});
  await call('POST', `/requests/${issued.id}/damage-report`, { description: 'Loose connector.' }, studentCookie);
  clock += 120000;
  const dashboard = (await call('GET', '/dashboard')).body.data;
  assert.deepEqual(dashboard, { equipment: { AVAILABLE: 1, ISSUED: 1 }, pending: 1, issued: 1, overdue: 1, unreviewedDamage: 1 });
  for (const filter of ['overdue=true', 'damage=true', 'status=ISSUED&overdue=true&damage=true']) {
    const list = await call('GET', `/requests?${filter}`);
    assert.equal(list.body.pagination.total, 1);
    assert.equal(list.body.data[0].id, issued.id);
  }
  assert.equal((await call('GET', '/requests?overdue=false&damage=false')).body.pagination.total, 1);
  assert.equal((await call('GET', '/requests?overdue=true', undefined, studentCookie)).status, 400);
  assert.equal((await call('POST', `/requests/${issued.id}/cancellation`, {}, studentCookie)).status, 409);
});

test('every domain route rejects missing authentication and each restricted role at its boundary', async () => {
  const equipment = await createAsset();
  const row = (await requestEquipment(equipment.id)).body.data;
  const adminOnly = [
    ['POST', '/equipment', asset],
    ['PATCH', `/equipment/${equipment.id}`, { action: 'EDIT_METADATA', version: 1, name: 'Updated equipment' }],
    ['DELETE', `/equipment/${equipment.id}`],
    ['POST', `/requests/${row.id}/decision`, { action: 'REJECT', reason: 'Synthetic test' }],
    ['POST', `/requests/${row.id}/issue`, {}],
    ['POST', `/requests/${row.id}/return`, { condition: 'SERVICEABLE' }],
    ['GET', '/dashboard'],
  ];
  const studentOnly = [
    ['POST', '/requests', { equipmentId: equipment.id, purpose: 'Synthetic boundary verification', requestKey: randomUUID(), requestedDueAt: new Date(clock + 60000).toISOString() }],
    ['POST', `/requests/${row.id}/damage-report`, { description: 'Synthetic boundary verification' }],
  ];
  const shared = [['GET', '/equipment'], ['GET', `/equipment/${equipment.id}`], ['GET', '/requests'], ['GET', `/requests/${row.id}`], ['POST', `/requests/${row.id}/cancellation`, {}]];
  for (const [method, path, body] of [...adminOnly, ...studentOnly, ...shared]) assert.equal((await call(method, path, body, null)).status, 401, `${method} ${path}`);
  for (const [method, path, body] of adminOnly) assert.equal((await call(method, path, body, studentCookie)).status, 403, `${method} ${path}`);
  for (const [method, path, body] of studentOnly) assert.equal((await call(method, path, body, adminCookie)).status, 403, `${method} ${path}`);
  assert.equal((await call('POST', `/requests/${row.id}/cancellation`, {}, otherCookie)).status, 404);
  assert.equal((await call('POST', `/requests/${row.id}/damage-report`, { description: 'Not issued' }, studentCookie)).status, 409);
  assert.equal((await call('POST', `/requests/${row.id}/issue`, {})).status, 409);
  assert.equal(await models.BorrowingRequest.countDocuments(), 1);
  assert.equal((await models.BorrowingRequest.findById(row.id)).status, 'PENDING');
  assert.equal((await models.Equipment.findById(equipment.id)).status, 'AVAILABLE');
});
