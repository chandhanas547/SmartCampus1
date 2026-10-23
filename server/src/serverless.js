import { createApp } from './app.js';
import { readConfig } from './config.js';
import { checkDatabase, connectDatabase } from './database.js';
import { prepareIdentity } from './identity/index.js';
import { prepareDomain } from './domain/models.js';

async function initialize() {
  const config = readConfig(process.env);
  const connection = await connectDatabase(config.mongoUri);
  try {
    await prepareIdentity(connection);
    await prepareDomain(connection);
    return createApp({ ...config, connection, checkDatabase: () => checkDatabase(connection) });
  } catch (error) {
    await connection.close();
    throw error;
  }
}

export function createServerlessHandler(start = initialize) {
  let application;
  return async (request, response) => {
    try {
      // Reuse one pool per warm instance; a failed cold start must not poison later requests.
      application ??= Promise.resolve().then(start).catch((error) => { application = undefined; throw error; });
      const app = await application;
      app(request, response);
    } catch {
      response.writeHead(503, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
      response.end(JSON.stringify({ error: { code: 'NOT_READY', message: 'Service temporarily unavailable.' } }));
    }
  };
}
