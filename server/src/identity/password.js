import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import { HttpError } from '../errors.js';

const derive = promisify(scrypt);
const parameters = { N: 131072, r: 8, p: 1, maxmem: 256 * 1024 * 1024 };
let active = 0;
async function key(password, salt) {
  if (active >= 2) throw new HttpError(503, 'AUTH_BUSY', 'Sign-in is busy. Please try again shortly.');
  active += 1;
  try { return await derive(password, salt, 64, parameters); }
  finally { active -= 1; }
}

export async function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  return `scrypt$131072$8$1$${salt}$${(await key(password, salt)).toString('hex')}`;
}

export async function verifyPassword(password, hash) {
  const [algorithm, n, r, p, salt, encoded] = hash.split('$');
  if (algorithm !== 'scrypt' || n !== '131072' || r !== '8' || p !== '1' || !/^[a-f0-9]{32}$/.test(salt) || !/^[a-f0-9]{128}$/.test(encoded)) return false;
  return timingSafeEqual(await key(password, salt), Buffer.from(encoded, 'hex'));
}
