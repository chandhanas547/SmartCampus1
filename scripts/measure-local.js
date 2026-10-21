import { readFile } from 'node:fs/promises';
import { performance } from 'node:perf_hooks';

// Uses synthetic local accounts only. Never print credentials or session cookies.
const base = 'http://127.0.0.1:3000';
const access = JSON.parse(await readFile(new URL('../.local/demo-access.json', import.meta.url), 'utf8'));
const started = performance.now();
const login = await fetch(`${base}/api/auth/login`, { method: 'POST', headers: { origin: 'http://127.0.0.1:5173', 'content-type': 'application/json', 'x-labflow-request': '1' }, body: JSON.stringify({ email: access.admin.email, password: access.admin.password }), signal: AbortSignal.timeout(10000) });
if (!login.ok) throw new Error(`Synthetic login failed (${login.status}); Retry-After: ${login.headers.get('retry-after') || 'unavailable'} seconds. Do not reset authentication limits.`);
const loginMs = performance.now() - started;
const cookie = login.headers.get('set-cookie').split(';')[0];
const results = {};
try {
  for (const path of ['/equipment?limit=20', '/requests?limit=20', '/dashboard']) {
    const samples = [];
    for (let index = 0; index < 32; index++) {
      const began = performance.now();
      const response = await fetch(`${base}/api${path}`, { headers: { cookie }, signal: AbortSignal.timeout(10000) });
      await response.json();
      if (!response.ok) throw new Error(`Read failed (${response.status})`);
      if (index >= 2) samples.push(performance.now() - began);
    }
    samples.sort((a, b) => a - b);
    results[path] = { samples: samples.length, medianMs: +samples[14].toFixed(2), p95Ms: +samples[28].toFixed(2), maxMs: +samples[29].toFixed(2) };
  }
  console.info(JSON.stringify({ environment: 'Local loopback, synthetic small dataset, sequential warm reads; not a hosted/load benchmark', timestamp: new Date().toISOString(), loginMs: +loginMs.toFixed(2), results }, null, 2));
} finally {
  await fetch(`${base}/api/auth/logout`, { method: 'POST', headers: { cookie, origin: 'http://127.0.0.1:5173', 'content-type': 'application/json', 'x-labflow-request': '1' }, body: '{}', signal: AbortSignal.timeout(10000) });
}
