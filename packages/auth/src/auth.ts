import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import prismaClient from '@repo/db'

let _auth: ReturnType<typeof betterAuth> | null = null;

export const getAuth = () => {
  console.log(process.env.DATABASE_URL)
  if (!_auth) {
    if (!process.env.BETTER_AUTH_SECRET || !process.env.BETTER_AUTH_URL) {
      throw new Error("BETTER_AUTH_SECRET or BETTER_AUTH_URL is missing at runtime");
    }
    _auth = betterAuth({
      baseURL: process.env.BETTER_AUTH_URL,
      secret: process.env.BETTER_AUTH_SECRET,
      database: prismaAdapter(prismaClient, {
        provider: "postgresql"
      }),
      emailAndPassword: {
        enabled: true,
      },
      socialProviders: {
        google: {
          clientId: process.env.GOOGLE_CLIENT_ID as string,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        },
      },
    })
  }
  return _auth;
}