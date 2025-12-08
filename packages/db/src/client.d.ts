import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
declare const prismaClient: PrismaClient<{
    log: ("info" | "query" | "warn" | "error")[];
    adapter: PrismaPg;
}, "info" | "query" | "warn" | "error", import("@prisma/client/runtime/client").DefaultArgs>;
export default prismaClient;
//# sourceMappingURL=client.d.ts.map