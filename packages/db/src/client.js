import "dotenv/config";
import { PrismaClient } from "../generated/prisma/index.js";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
const getConnectionString = () => {
    if (!process.env.DATABASE_URL) {
        return "";
    }
    try {
        const url = new URL(process.env.DATABASE_URL);
        // Remove sslmode from the URL to allow explicit ssl config in Pool to take precedence
        url.searchParams.delete('sslmode');
        return url.toString();
    }
    catch (e) {
        return process.env.DATABASE_URL;
    }
};
const prismaClientSingleton = () => {
    const connectionString = process.env.DATABASE_URL;
    console.log("Database Connection String Status:", connectionString ? "Defined (Length: " + connectionString.length + ")" : "Undefined/Empty");
    const pool = new Pool({
      connectionString: getConnectionString(), // existing helper
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
      ssl: {
        rejectUnauthorized: false
      }
    });
    const adapter = new PrismaPg(pool);
    return new PrismaClient({ adapter });
};
const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();
if (process.env.NODE_ENV !== 'production') {
    globalThis.prismaGlobal = prisma;
}
export default prisma;
