import assert from 'node:assert/strict';
import { test } from 'node:test';
import { apiRequest } from './api.js';

test('API client uses same-origin credentials and unwraps success', async (t) => {
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    assert.equal(url, '/api/health');
    assert.equal(options.credentials, 'same-origin');
    assert.equal(options.headers.Accept, 'application/json');
    return Response.json({ data: { status: 'ready' } });
  });
  assert.deepEqual(await apiRequest('/health'), { status: 'ready' });
});

test('API client handles 204 without trying to parse JSON', async (t) => {
  t.mock.method(globalThis, 'fetch', async () => new Response(null, { status: 204 }));
  assert.equal(await apiRequest('/auth/logout', { method: 'POST' }), undefined);
});

test('API client gives safe actionable errors for service and network failures', async (t) => {
  t.mock.method(globalThis, 'fetch', async () => Response.json({ error: { message: 'Database internals' } }, { status: 503 }));
  await assert.rejects(apiRequest('/health'), /temporarily unavailable/);
  globalThis.fetch.mock.mockImplementation(async () => { throw new TypeError('private networking detail'); });
  await assert.rejects(apiRequest('/health'), /connection/);
});

test('API client rejects HTML and malformed success envelopes', async (t) => {
  t.mock.method(globalThis, 'fetch', async () => new Response('<html>Proxy error</html>'));
  await assert.rejects(apiRequest('/health'), /Unexpected response/);
  globalThis.fetch.mock.mockImplementation(async () => Response.json({ status: 'wrong envelope' }));
  await assert.rejects(apiRequest('/health'), /Unexpected response/);
});

test('API client passes cancellation through and does not retry mutations', async (t) => {
  const controller = new AbortController();
  controller.abort();
  const fetch = t.mock.method(globalThis, 'fetch', async (_url, options) => {
    options.signal.throwIfAborted();
  });
  await assert.rejects(apiRequest('/requests', { method: 'POST', signal: controller.signal }), { name: 'AbortError' });
  assert.equal(fetch.mock.callCount(), 1);
});
