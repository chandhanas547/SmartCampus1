import assert from 'node:assert/strict';
import { test } from 'node:test';
import { cloudTestUri } from './database-fixture.js';

const uri = 'mongodb+srv://synthetic-user:not-a-real-password@fake-cluster.mongodb.net/labflow_acceptance?authSource=admin';

test('cloud acceptance targets only the three dedicated test databases', () => {
  for (const suite of ['database', 'identity', 'domain']) {
    const target = new URL(cloudTestUri(uri, suite));
    assert.equal(target.pathname, `/labflow_acceptance_${suite}`);
    assert.equal(target.searchParams.get('authSource'), 'admin');
  }
});

test('cloud acceptance refuses demo/production names, non-Atlas hosts and unknown suites', () => {
  for (const input of [undefined, '', uri.replace('/labflow_acceptance', '/labflow'), uri.replace('/labflow_acceptance', '/%6cabflow_acceptance'), uri.replace('fake-cluster.mongodb.net', 'example.com'), uri.replace('mongodb+srv:', 'mongodb:'), uri.replace('synthetic-user:not-a-real-password@', ''), `${uri}&tls=false`, `${uri}&w=1`]) {
    assert.throws(() => cloudTestUri(input, 'domain'), /dedicated Atlas acceptance/);
  }
  assert.throws(() => cloudTestUri(uri, 'labflow'), /dedicated Atlas acceptance/);
});
