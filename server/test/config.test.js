import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readConfig } from '../src/config.js';

test('development requires a database URI and uses local defaults', () => {
  assert.throws(() => readConfig({}), /MONGODB_URI/);
  const config = readConfig({ MONGODB_URI: 'mongodb://127.0.0.1/labflow' });
  assert.equal(config.port, 3000);
  assert.equal(config.origin, 'http://localhost:5173');
  assert.equal(config.host, '127.0.0.1');
});

test('invalid settings fail without exposing their values', () => {
  for (const invalid of [
    { PORT: '0' }, { PORT: '65536' }, { PORT: '3e3' },
    { NODE_ENV: 'staging' }, { MONGODB_URI: 'https://example.invalid/private-value' },
    { APP_ORIGIN: 'http://localhost:5173/path' },
    { APP_ORIGIN: 'http://user:private-value@localhost' },
  ]) {
    assert.throws(() => readConfig({ MONGODB_URI: 'mongodb://127.0.0.1/labflow', ...invalid }),
      (error) => !error.message.includes('private-value'));
  }
});

test('production requires an explicit HTTPS origin', () => {
  const env = { NODE_ENV: 'production', MONGODB_URI: 'mongodb://127.0.0.1/labflow' };
  assert.throws(() => readConfig(env), /APP_ORIGIN/);
  assert.throws(() => readConfig({ ...env, APP_ORIGIN: 'http://example.com' }), /APP_ORIGIN/);
  assert.equal(readConfig({ ...env, APP_ORIGIN: 'https://lab.example.com' }).production, true);
});
