import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from "../generated/prisma/index.js";

const getConnectionString = () => {
  if (!process.env.DATABASE_URL) {
    return "";
  }
  try {
    const url = new URL(process.env.DATABASE_URL);
    return url.toString();
  } catch (e) {
    return process.env.DATABASE_URL;
  }
}


const prismaClientSingleton = () => {
  const connectionString = getConnectionString();
  console.log("Database Connection String Status:", connectionString ? "Defined (Length: " + connectionString.length + ")" : "Undefined/Empty");
  const pool = new Pool({
    connectionString,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
    ssl: {
      rejectUnauthorized: false
    }
  });
  const adapter = new PrismaPg(pool);

  return new PrismaClient({ adapter });
}

declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>;
}
const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') {
  globalThis.prismaGlobal = prisma;
}

export default prisma