import { connectDatabase } from '../src/database.js';

export function cloudTestUri(uri, suite) {
  const invalid = () => new Error('Use a dedicated Atlas acceptance URI and a known test suite.');
  let url;
  try { url = new URL(uri); } catch { throw invalid(); }
  const options = { authSource: 'admin', retryWrites: 'true', w: 'majority' };
  if (url.protocol !== 'mongodb+srv:' || !url.hostname.endsWith('.mongodb.net') ||
      !url.username || !url.password || url.port || url.hash || url.pathname !== '/labflow_acceptance' ||
      !['database', 'identity', 'domain'].includes(suite) ||
      [...url.searchParams].some(([key, value]) => options[key] !== value)) throw invalid();
  url.pathname = `/labflow_acceptance_${suite}`;
  return url.toString();
}

export async function openTestDatabase(suite) {
  if (process.env.LABFLOW_CLOUD_ACCEPTANCE !== '1') {
    if (process.env.MONGODB_ACCEPTANCE_URI) throw new Error('Cloud credentials require the explicit test:cloud command.');
    const { MongoMemoryReplSet } = await import('mongodb-memory-server-core');
    const replica = await MongoMemoryReplSet.create({ replSet: { count: 1, ip: '127.0.0.1' } });
    try {
      const connection = await connectDatabase(replica.getUri(`labflow_${suite}_test`));
      return { connection, async close() { try { await connection.close(); } finally { await replica.stop(); } } };
    } catch (error) { await replica.stop(); throw error; }
  }
  const uri = cloudTestUri(process.env.MONGODB_ACCEPTANCE_URI, suite);
  let connection;
  try {
    connection = await connectDatabase(uri);
    if ((await connection.db.listCollections().toArray()).length) throw new Error('Test database is not empty.');
  } catch {
    await connection?.close();
    throw new Error('Cloud acceptance requires accessible, empty dedicated test databases. No records were cleared.');
  }
  return {
    connection,
    async close() {
      // The readiness test closes its connection; reconnect only to clean this isolated fixture.
      const cleanup = connection.readyState === 1 ? connection : await connectDatabase(uri);
      try {
        for (const { name } of await cleanup.db.listCollections().toArray()) await cleanup.db.collection(name).drop();
      } finally { await cleanup.close(); }
    },
  };
}
