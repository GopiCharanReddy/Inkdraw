import { z } from 'zod';

const envSchema = z.object({
  PORT: z.string().default("8080"),
  DATABASE_URL: z.url(),
  FRONTEND_URL: z.url().optional(),
  HTTP_URL: z.url().optional(),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
})

export const config = envSchema.parse({
  PORT: process.env.PORT,
  DATABASE_URL: process.env.DATABASE_URL,
  FRONTEND_URL: process.env.FRONTEND_URL,
  HTTP_URL: process.env.HTTP_URL,
  NODE_ENV: process.env.NODE_ENV,
});