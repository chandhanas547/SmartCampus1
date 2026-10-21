import { randomBytes } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { readConfig } from '../server/src/config.js';
import { connectDatabase } from '../server/src/database.js';
import { prepareIdentity } from '../server/src/identity/index.js';
import { createAdministrator } from '../server/src/identity/admin.js';
import { userModel } from '../server/src/identity/user.js';
import { hashPassword } from '../server/src/identity/password.js';
import { domainModels, prepareDomain } from '../server/src/domain/models.js';

let connection;
try {
  const config = readConfig(process.env);
  if (config.production || !/^mongodb:\/\/(127\.0\.0\.1|localhost):27017\/labflow\?/.test(config.mongoUri)) throw new Error('Local demo database only');
  connection = await connectDatabase(config.mongoUri);
  await prepareIdentity(connection); await prepareDomain(connection);
  const directory = fileURLToPath(new URL('../.local/', import.meta.url));
  const path = `${directory}/demo-access.json`;
  await mkdir(directory, { recursive: true });
  let access;
  try { access = JSON.parse(await readFile(path, 'utf8')); }
  catch (error) {
    if (error.code !== 'ENOENT') throw error;
    access = {
      admin: { name: 'Demo Lab Administrator', email: 'admin@labflow.example.test', password: randomBytes(24).toString('base64url') },
      student: { name: 'Demo Student', email: 'student@labflow.example.test', password: randomBytes(24).toString('base64url') },
    };
    // Store before creating accounts so an interrupted run retains its generated credentials.
    await writeFile(path, JSON.stringify(access, null, 2), { mode: 0o600, flag: 'wx' });
  }
  const User = userModel(connection);
  let admin = await User.findOne({ email: access.admin.email });
  if (admin && admin.role !== 'ADMIN') throw new Error('Existing account has a different role');
  if (!admin) { await createAdministrator(connection, access.admin); admin = await User.findOne({ email: access.admin.email }); }
  if (!await User.exists({ email: access.student.email })) await User.create({ name: access.student.name, email: access.student.email, passwordHash: await hashPassword(access.student.password), role: 'STUDENT' });
  const { Equipment } = domainModels(connection);
  for (const [assetTag, name, category, description, location] of [
    ['LAB-001', 'Digital oscilloscope', 'Electronics', 'A bench oscilloscope for signal measurement and circuit experiments.', 'Electronics bench 1'],
    ['LAB-002', 'Digital multimeter', 'Electronics', 'Measure voltage, current and resistance. Return leads with the instrument.', 'Electronics cabinet'],
    ['LAB-003', 'Compound microscope', 'Optics', 'A laboratory microscope with prepared slide holders.', 'Optics bench'],
    ['LAB-004', 'Arduino starter kit', 'Prototyping', 'Controller board, breadboard and a set of basic components.', 'Project cabinet'],
    ['LAB-005', 'Bench power supply', 'Electronics', 'Adjustable regulated supply for supervised laboratory projects.', 'Electronics bench 2'],
    ['LAB-006', 'Vernier caliper', 'Measurement', 'Precision measurement tool in its protective case.', 'Measurement cabinet'],
  ]) {
    if (!await Equipment.exists({ assetTag })) await Equipment.create({ assetTag, name, category, description, location, updatedBy: admin._id, conditionNote: 'Synthetic demo asset. Inspect at issue and return.' });
  }
  console.info('Local synthetic demo data is ready. Generated credentials are in ignored .local/demo-access.json; they were not printed.');
} catch {
  console.error('Demo seeding failed. Check the local database, configuration and existing demo account roles.');
  process.exitCode = 1;
} finally { await connection?.close(); }
