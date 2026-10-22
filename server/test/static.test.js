import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createApp } from '../src/app.js';

let directory;
let temporaryRoot;
let server;
let base;
before(async () => {
  temporaryRoot = await mkdtemp(join(tmpdir(), 'labflow-static-test-'));
  directory = join(temporaryRoot, '.checkout');
  await mkdir(join(directory, 'assets'), { recursive: true });
  await writeFile(join(directory, 'index.html'), '<!doctype html><title>LabFlow</title>');
  await writeFile(join(directory, 'assets/app.js'), 'export const ready = true;');
  server = createApp({ clientDist: directory, checkDatabase: async () => {}, origin: 'https://lab.example.com', production: true }).listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  base = `http://127.0.0.1:${server.address().port}`;
});
after(async () => {
  if (server) await new Promise((resolve) => server.close(resolve));
  if (temporaryRoot) await rm(temporaryRoot, { recursive: true });
});

test('a production deep link receives the SPA with HTTPS security headers', async () => {
  const response = await fetch(`${base}/requests/example`, { headers: { accept: 'text/html' } });
  assert.equal(response.status, 200);
  assert.match(await response.text(), /<title>LabFlow<\/title>/);
  assert.match(response.headers.get('strict-transport-security'), /max-age/);
  assert.match(response.headers.get('content-security-policy'), /upgrade-insecure-requests/);
});

test('unknown API paths and missing JavaScript assets never receive HTML', async () => {
  for (const path of ['/api/unknown', '/assets/missing.js']) {
    const response = await fetch(`${base}${path}`, { headers: { accept: 'text/html' } });
    assert.equal(response.status, 404);
    assert.match(response.headers.get('content-type'), /application\/json/);
  }
});

test('existing JavaScript assets are served with their correct content type', async () => {
  const response = await fetch(`${base}/assets/app.js`);
  assert.equal(response.status, 200);
  assert.match(response.headers.get('content-type'), /javascript/);
});
