import { z } from 'zod';

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.string().regex(/^\d+$/).transform(Number).pipe(z.number().int().min(1).max(65535)).default(3000),
  HOST: z.enum(['127.0.0.1', '0.0.0.0']).default('127.0.0.1'),
  MONGODB_URI: z.string().regex(/^mongodb(?:\+srv)?:\/\/\S+$/),
  APP_ORIGIN: z.url().optional(),
});

export function readConfig(env) {
  const parsed = schema.safeParse(env);
  if (!parsed.success) {
    const keys = [...new Set(parsed.error.issues.map((issue) => issue.path[0]))];
    throw new Error(`Invalid configuration: ${keys.join(', ')}`);
  }
  const values = parsed.data;
  const production = values.NODE_ENV === 'production';
  if (production && !values.APP_ORIGIN) throw new Error('APP_ORIGIN is required in production');
  const origin = values.APP_ORIGIN ?? 'http://localhost:5173';
  const url = new URL(origin);
  if (!['http:', 'https:'].includes(url.protocol) || url.origin !== origin ||
      url.username || url.password || (production && url.protocol !== 'https:')) {
    throw new Error('Invalid configuration: APP_ORIGIN');
  }
  return { production, port: values.PORT, host: values.HOST, mongoUri: values.MONGODB_URI, origin };
}
