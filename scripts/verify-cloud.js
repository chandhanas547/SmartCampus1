import { spawnSync } from 'node:child_process';
import { cloudTestUri } from '../server/test/database-fixture.js';

cloudTestUri(process.env.MONGODB_ACCEPTANCE_URI, 'domain');
const result = spawnSync(process.execPath, ['--test', ...['database', 'identity', 'domain'].map((suite) => `server/test/integration/${suite}.test.js`)], {
  stdio: 'inherit', env: { ...process.env, LABFLOW_CLOUD_ACCEPTANCE: '1' },
});
process.exitCode = result.status ?? 1;
