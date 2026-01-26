import { PrismaClient } from "@prisma/client";

declare namespace Express {
  interface Request {
    userId?: string
  }
}

declare global {
  var prisma: PrismaClient | undefined;
}

export { };