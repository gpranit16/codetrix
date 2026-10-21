import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const envSchema = z.object({
  PORT: z.coerce.number().default(4000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  JWT_SECRET: z.string().min(8, 'JWT_SECRET must be at least 8 characters'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  OTP_EXPIRY_MINUTES: z.coerce.number().default(10),
  OTP_RESEND_COOLDOWN_SECONDS: z.coerce.number().default(30),
  MAX_OTP_ATTEMPTS: z.coerce.number().default(5),
  MAX_UPLOAD_SIZE_MB: z.coerce.number().default(5),
  UPLOAD_DIR: z.string().default('./uploads'),
});

export const env = envSchema.parse(process.env);
