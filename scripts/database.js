import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { MongoMemoryReplSet } from 'mongodb-memory-server-core';

// Development only: a real, persistent, loopback-only replica set. No cloud account needed.
// https://typegoose.github.io/mongodb-memory-server/docs/guides/quick-start-guide/#replicaset
const dbPath = fileURLToPath(new URL('../.local/mongodb/', import.meta.url));
await mkdir(dbPath, { recursive: true });
const replica = await MongoMemoryReplSet.create({
  instanceOpts: [{ port: 27017, dbPath }],
  replSet: { count: 1, name: 'labflow-dev', storageEngine: 'wiredTiger', ip: '127.0.0.1' },
});
console.info('Local development database ready on 127.0.0.1:27017. Data persists in .local/mongodb.');
let stopping = false;
async function stop() {
  if (stopping) return;
  stopping = true;
  await replica.stop({ doCleanup: false });
}
process.on('SIGINT', stop);
process.on('SIGTERM', stop);
