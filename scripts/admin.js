import { readConfig } from '../server/src/config.js';
import { connectDatabase } from '../server/src/database.js';
import { prepareIdentity } from '../server/src/identity/index.js';
import { createAdministrator } from '../server/src/identity/admin.js';

let connection;
try {
  const config = readConfig(process.env);
  connection = await connectDatabase(config.mongoUri);
  await prepareIdentity(connection);
  await createAdministrator(connection, { name: process.env.ADMIN_NAME, email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_PASSWORD });
  console.info('Administrator created. Credentials were not printed.');
} catch {
  console.error('Admin creation failed. Check configuration and input; existing accounts are never elevated.');
  process.exitCode = 1;
} finally { await connection?.close(); }
