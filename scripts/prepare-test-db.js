import { MongoBinary } from 'mongodb-memory-server-core';

// Finish a cold download once before Node starts parallel integration-test files.
// This is explicit test setup, never an npm dependency installation hook.
await MongoBinary.getPath();
console.info('Pinned MongoDB test binary is ready.');
