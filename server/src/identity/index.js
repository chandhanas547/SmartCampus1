import { Router } from 'express';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import { createHmac } from 'node:crypto';
import { promisify } from 'node:util';
import { z } from 'zod';
import { HttpError, requireUser } from '../errors.js';
import { hashPassword, verifyPassword } from './password.js';
import { loginInput, registrationInput, safeUser, userModel } from './user.js';

export const SESSION_MS = 8 * 60 * 60 * 1000;
export async function prepareIdentity(connection) {
  await userModel(connection).init();
  await connection.db.collection('authLimits').createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
}

export function createIdentity({ connection, sessionSecret, production, now = Date.now }) {
  const User = userModel(connection);
  const cookieName = production ? '__Host-labflow.sid' : 'labflow.sid';
  const cookie = { httpOnly: true, secure: production, sameSite: 'lax', path: '/', maxAge: SESSION_MS };
  const store = MongoStore.create({ client: connection.getClient(), dbName: connection.name, collectionName: 'sessions' });
  store.on('error', () => console.error('Session storage is unavailable.'));
  const sessions = session({ name: cookieName, secret: sessionSecret, store, resave: false, saveUninitialized: false, rolling: false, cookie });
  // Missing-account login still performs the same scrypt work; this is not an account credential.
  const dummyHash = `scrypt$131072$8$1$${'0'.repeat(32)}$${'0'.repeat(128)}`;
  const router = Router();

  async function restoreUser(request, response, next) {
    if (request.session?.userId) {
      if (!Number.isFinite(request.session.authenticatedAt) || now() - request.session.authenticatedAt >= SESSION_MS) {
        await promisify(request.session.destroy.bind(request.session))();
        response.clearCookie(cookieName, { ...cookie, maxAge: undefined });
      } else {
        request.user = await User.findById(request.session.userId);
      }
    }
    next();
  }

  async function limit(request, response, next) {
    const window = Math.floor(now() / 900000);
    const id = createHmac('sha256', sessionSecret).update(`${request.ip}:${window}`).digest('hex');
    const row = await connection.db.collection('authLimits').findOneAndUpdate({ _id: id }, {
      $inc: { attempts: 1 }, $setOnInsert: { expiresAt: new Date((window + 1) * 900000) },
    }, { upsert: true, returnDocument: 'after' });
    if (row.attempts > 10) {
      response.set('Retry-After', String(Math.max(1, Math.ceil(((window + 1) * 900000 - now()) / 1000))));
      throw new HttpError(429, 'RATE_LIMITED', 'Too many attempts. Please try again later.');
    }
    next();
  }

  router.post('/register', limit, async (request, response) => {
    z.strictObject({}).parse(request.query);
    const input = registrationInput.parse(request.body);
    const user = await User.create({ name: input.name, email: input.email, passwordHash: await hashPassword(input.password), role: 'STUDENT' });
    response.status(201).json({ data: safeUser(user) });
  });
  router.post('/login', limit, async (request, response) => {
    z.strictObject({}).parse(request.query);
    const input = loginInput.parse(request.body);
    const user = await User.findOne({ email: input.email }).select('+passwordHash');
    const valid = await verifyPassword(input.password, user?.passwordHash || dummyHash);
    if (!valid || !user) throw new HttpError(401, 'INVALID_CREDENTIALS', 'Email or password is incorrect.');
    await promisify(request.session.regenerate.bind(request.session))();
    request.session.userId = user._id.toString();
    request.session.authenticatedAt = now();
    await promisify(request.session.save.bind(request.session))();
    response.json({ data: safeUser(user) });
  });
  router.get('/me', requireUser, (request, response) => {
    z.strictObject({}).parse(request.query);
    response.json({ data: safeUser(request.user) });
  });
  router.post('/logout', requireUser, async (request, response) => {
    z.strictObject({}).parse(request.query);
    z.strictObject({}).parse(request.body ?? {});
    await promisify(request.session.destroy.bind(request.session))();
    response.clearCookie(cookieName, { ...cookie, maxAge: undefined }).sendStatus(204);
  });
  return { sessions, restoreUser, router };
}
