import "dotenv/config";
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from "../generated/prisma/index.js";
declare const prismaClientSingleton: () => PrismaClient<{
    adapter: PrismaPg;
}, never, import("../generated/prisma/runtime/client.js").DefaultArgs>;
declare global {
    var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>;
}
declare const prisma: PrismaClient<{
    adapter: PrismaPg;
}, never, import("../generated/prisma/runtime/client.js").DefaultArgs>;
export default prisma;
//# sourceMappingURL=client.d.ts.map