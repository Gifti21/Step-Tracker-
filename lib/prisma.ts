import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const DB_PATH = process.env.DB_PATH ?? "./prisma/dev.db";

declare global {
    // eslint-disable-next-line no-var
    var __prisma: PrismaClient | undefined;
}

function createClient(): PrismaClient {
    const adapter = new PrismaBetterSqlite3({ url: DB_PATH });
    // @ts-expect-error - Prisma v7 adapter constructor
    return new PrismaClient({ adapter });
}

export const prisma: PrismaClient = global.__prisma ?? createClient();

if (process.env.NODE_ENV !== "production") {
    global.__prisma = prisma;
}
