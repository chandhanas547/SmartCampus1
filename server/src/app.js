import express from 'express';
import helmet from 'helmet';
import { z } from 'zod';
import { join } from 'node:path';

export function createApp({ checkDatabase, origin, production = false, clientDist }) {
  const app = express();
  app.disable('x-powered-by');
  app.use(helmet({
    contentSecurityPolicy: { directives: { 'upgrade-insecure-requests': production ? [] : null } },
    strictTransportSecurity: production ? undefined : false,
  }));
  app.use('/api', (request, response, next) => {
    response.set('Cache-Control', 'no-store');
    if (!['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
      if (request.get('origin') !== origin || request.get('sec-fetch-site') === 'cross-site') {
        return response.status(403).json({ error: { code: 'UNTRUSTED_ORIGIN', message: 'Request origin is not allowed.' } });
      }
      if (!request.is('application/json')) {
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
  app.use('/api', (_request, response) => {
    response.status(404).json({ error: { code: 'NOT_FOUND', message: 'Resource not found.' } });
  });
  if (clientDist) {
    app.use(express.static(clientDist, { index: false }));
    app.get('/{*path}', (request, response, next) => {
      if (!request.accepts('html') || request.path.startsWith('/assets/')) return next();
      response.set('Cache-Control', 'no-cache').sendFile(join(clientDist, 'index.html'));
    });
  }
  app.use((_request, response) => response.status(404).json({ error: { code: 'NOT_FOUND', message: 'Resource not found.' } }));
  // Express 5 forwards rejected async handlers to this error boundary.
  // https://expressjs.com/en/guide/error-handling/
  app.use((error, _request, response, next) => {
    if (response.headersSent) return next(error);
    if (error instanceof z.ZodError || error.type === 'entity.parse.failed') {
      return response.status(400).json({ error: { code: 'INVALID_INPUT', message: 'Check the request input.' } });
    }
    if (error.type === 'entity.too.large') {
      return response.status(413).json({ error: { code: 'PAYLOAD_TOO_LARGE', message: 'Request body is too large.' } });
    }
    response.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Something went wrong. Please try again.' } });
  });
  return app;
}
