import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('4000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  AWS_REGION: z.string().default('us-east-1'),
  AWS_ACCESS_KEY_ID: z.string().default('local'),
  AWS_SECRET_ACCESS_KEY: z.string().default('local'),
  DYNAMODB_ENDPOINT: z.string().optional(),

  JWT_SECRET: z.string().min(8).default('spectraleaf-dev-secret-change-me'),
  JWT_EXPIRES_IN: z.string().default('12h'),

  TABLE_READINGS: z.string().default('SpectraLeaf_Readings'),
  TABLE_BATCHES: z.string().default('SpectraLeaf_Batches'),
  TABLE_DEVICES: z.string().default('SpectraLeaf_Devices'),
  TABLE_USERS: z.string().default('SpectraLeaf_Users'),

  CORS_ORIGIN: z.string().default('http://localhost:3000'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment configuration:', parsed.error.format());
  process.exit(1);
}

export const env = {
  ...parsed.data,
  PORT: parseInt(parsed.data.PORT, 10),
};
