import { z } from 'zod';

const configSchema = z.object({
  NEXT_PUBLIC_HTTP_URL: z.url(),
  NEXT_PUBLIC_WS_URL: z.url(),
})

export const config = configSchema.parse({
  NEXT_PUBLIC_HTTP_URL: process.env.NEXT_PUBLIC_HTTP_URL,
  NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL
});