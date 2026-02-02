import { z } from 'zod';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default('5000'),
  API_PREFIX: z.string().default('/api'),
  DATABASE_URL: z.string(),
  JWT_ACCESS_SECRET: z.string(),
  JWT_REFRESH_SECRET: z.string(),
  JWT_ACCESS_EXPIRY: z.string().default('15m'),
  JWT_REFRESH_EXPIRY: z.string().default('7d'),
  CORS_ORIGIN: z.string().default('http://localhost:3000'),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
});

const envVars = envSchema.safeParse(process.env);

if (!envVars.success) {
  console.error('❌ Invalid environment variables:', envVars.error.format());
  process.exit(1);
}

export const config = {
  env: envVars.data.NODE_ENV,
  port: envVars.data.PORT,
  apiPrefix: envVars.data.API_PREFIX,
  database: {
    url: envVars.data.DATABASE_URL,
  },
  jwt: {
    accessSecret: envVars.data.JWT_ACCESS_SECRET,
    refreshSecret: envVars.data.JWT_REFRESH_SECRET,
    accessExpiry: envVars.data.JWT_ACCESS_EXPIRY,
    refreshExpiry: envVars.data.JWT_REFRESH_EXPIRY,
  },
  cors: {
    origin: envVars.data.CORS_ORIGIN,
  },
  logLevel: envVars.data.LOG_LEVEL,
};
