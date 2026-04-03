import path from "node:path";
import { defineConfig } from "prisma/config";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const dbPath = path.join(process.cwd(), "prisma", "dev.db");

export default defineConfig({
    schema: path.join("prisma", "schema.prisma"),
    migrate: {
        adapter() {
            return new PrismaBetterSqlite3({ url: dbPath });
        },
    },
});
