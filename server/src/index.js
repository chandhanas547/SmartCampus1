import { fileURLToPath } from 'node:url';
import { access } from 'node:fs/promises';
import { createApp } from './app.js';
import { readConfig } from './config.js';
import { checkDatabase, connectDatabase } from './database.js';

let connection;
try {
  const config = readConfig(process.env);
  const clientDist = config.production ? fileURLToPath(new URL('../../client/dist/', import.meta.url)) : undefined;
  if (clientDist) await access(`${clientDist}/index.html`);
  connection = await connectDatabase(config.mongoUri);
  const app = createApp({ ...config, clientDist, checkDatabase: () => checkDatabase(connection) });
  const server = app.listen(config.port, config.host);
  await new Promise((resolve, reject) => {
    server.once('listening', resolve);
    server.once('error', reject);
  });
  console.info(`LabFlow listening on ${config.host}:${config.port}`);
  let stopping = false;
  const shutdown = () => {
    if (stopping) return;
    stopping = true;
    const deadline = setTimeout(() => process.exit(1), 10000).unref();
    server.close(async () => {
      await connection.close();
      clearTimeout(deadline);
    });
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
} catch {
  // Never print connection strings or environment values, even on startup failure.
  console.error('Startup failed. Check environment settings, MongoDB replica-set access, and the production build.');
  await connection?.close();
  process.exitCode = 1;
}
