import express from 'express';
import helmet from 'helmet';
import { z } from 'zod';
import { createIdentity } from './identity/index.js';
import { HttpError } from './errors.js';
import { domainRouter } from './domain/routes.js';

export function createApp({ checkDatabase, origin, production = false, clientDist, connection, sessionSecret, now, trustProxyHops = 0 }) {
  const app = express();
  app.disable('x-powered-by');
  app.set('trust proxy', trustProxyHops);
  app.use(helmet({
    contentSecurityPolicy: { directives: {
      'style-src': ["'self'", 'https://fonts.googleapis.com'],
      'font-src': ["'self'", 'https://fonts.gstatic.com'],
      'upgrade-insecure-requests': production ? [] : null,
    } },
    strictTransportSecurity: production ? undefined : false,
  }));
  app.use('/api', (request, response, next) => {
    response.set('Cache-Control', 'no-store');
    if (!['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
      if (request.get('origin') !== origin || request.get('sec-fetch-site') === 'cross-site') {
        return response.status(403).json({ error: { code: 'UNTRUSTED_ORIGIN', message: 'Request origin is not allowed.' } });
      }
      if (request.get('x-labflow-request') !== '1') {
        return response.status(403).json({ error: { code: 'CSRF_REJECTED', message: 'Refresh the page and try again.' } });
      }
      if (request.get('content-type')?.split(';')[0].trim().toLowerCase() !== 'application/json') {
        return response.status(415).json({ error: { code: 'UNSUPPORTED_MEDIA_TYPE', message: 'Use application/json.' } });
      }
    }
    next();
  });
  app.use('/api', express.json({ limit: '16kb' }));
  app.get('/api/health', async (request, response) => {
    z.strictObject({}).parse(request.query);
    try {
      await checkDatabase();
      response.json({ data: { status: 'ready' } });
    } catch {
      response.status(503).json({ error: { code: 'NOT_READY', message: 'Service temporarily unavailable.' } });
    }
  });
  if (connection) {
    const identity = createIdentity({ connection, sessionSecret, production, now });
    app.use('/api', identity.sessions, identity.restoreUser);
    app.use('/api/auth', identity.router);
    app.use('/api', domainRouter(connection, now));
  }
  app.use('/api', (_request, response) => {
    response.status(404).json({ error: { code: 'NOT_FOUND', message: 'Resource not found.' } });
  });
  if (clientDist) {
    app.use(express.static(clientDist, { index: false }));
    app.get('/{*path}', (request, response, next) => {
      if (!request.accepts('html') || request.path.startsWith('/assets/')) return next();
      response.set('Cache-Control', 'no-cache').sendFile('index.html', { root: clientDist });
    });
  }
  app.use((_request, response) => response.status(404).json({ error: { code: 'NOT_FOUND', message: 'Resource not found.' } }));
  // Express 5 forwards rejected async handlers to this error boundary.
  // https://expressjs.com/en/guide/error-handling/
  app.use((error, _request, response, next) => {
    if (response.headersSent) return next(error);
    if (error instanceof HttpError) {
      return response.status(error.status).json({ error: { code: error.code, message: error.message } });
    }
    if (error.code === 11000) {
      return response.status(409).json({ error: { code: 'DUPLICATE', message: 'A record with these values already exists.' } });
    }
    if (error instanceof z.ZodError || error.type === 'entity.parse.failed') {
      return response.status(400).json({ error: { code: 'INVALID_INPUT', message: 'Check the request input.' } });
    }
    if (error.type === 'entity.too.large') {
      return response.status(413).json({ error: { code: 'PAYLOAD_TOO_LARGE', message: 'Request body is too large.' } });
    }
    if (['charset.unsupported', 'encoding.unsupported'].includes(error.type)) {
      return response.status(415).json({ error: { code: 'UNSUPPORTED_MEDIA_TYPE', message: 'Use UTF-8 application/json.' } });
    }
    console.error(JSON.stringify({ event: 'request_failed', name: error.name, code: String(error.code ?? 'UNEXPECTED'), field: error.path }));
    response.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Something went wrong. Please try again.' } });
  });
  return app;
}
