import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { MongoMemoryReplSet } from 'mongodb-memory-server-core';
import { checkDatabase, connectDatabase } from '../../src/database.js';

let replica;
let connection;
before(async () => {
  replica = await MongoMemoryReplSet.create({ replSet: { count: 1, storageEngine: 'wiredTiger', ip: '127.0.0.1' } });
  connection = await connectDatabase(replica.getUri('labflow_test'));
  await connection.db.createCollection('assets');
  await connection.db.createCollection('requests');
});
after(async () => {
  await connection?.close();
  await replica?.stop();
});

test('real replica set is ready and commits writes to both collections', async () => {
  await checkDatabase(connection);
  await connection.transaction(async (session) => {
    await connection.db.collection('assets').insertOne({ tag: 'LAB-001' }, { session });
    await connection.db.collection('requests').insertOne({ tag: 'LAB-001' }, { session });
  });
  assert.equal(await connection.db.collection('assets').countDocuments({ tag: 'LAB-001' }), 1);
  assert.equal(await connection.db.collection('requests').countDocuments({ tag: 'LAB-001' }), 1);
});

test('failure after the first write rolls the transaction back completely', async () => {
  await assert.rejects(connection.transaction(async (session) => {
    await connection.db.collection('assets').insertOne({ tag: 'ROLLBACK' }, { session });
    throw new Error('Injected failure between writes');
  }), /Injected failure/);
  assert.equal(await connection.db.collection('assets').countDocuments({ tag: 'ROLLBACK' }), 0);
  assert.equal(await connection.db.collection('requests').countDocuments({ tag: 'ROLLBACK' }), 0);
});

test('readiness fails after database disconnects', async () => {
  await connection.close();
  await assert.rejects(checkDatabase(connection), /unavailable/);
});
