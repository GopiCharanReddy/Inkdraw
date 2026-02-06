import { PrismaClient } from './generated/prisma/index.js';
import "dotenv/config";
async function main() {
    const url = process.env.DATABASE_URL;
    console.log("Testing connection to:", url?.replace(/:[^:]+@/, ':****@')); // mask password
    const prisma = new PrismaClient();
    try {
        await prisma.$connect();
        console.log("Successfully connected to database!");
        const userCount = await prisma.user.count();
        console.log("User count:", userCount);
        process.exit(0);
    }
    catch (e) {
        console.error("Connection failed:", e);
        process.exit(1);
    }
    finally {
        await prisma.$disconnect();
    }
}
main();
