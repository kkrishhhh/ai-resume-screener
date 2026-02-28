import { PrismaClient } from "@prisma/client";

// Use a global variable to cache the client across hot reloads in development
const globalForPrisma = globalThis as unknown as {
    _prisma: PrismaClient | undefined;
};

function getPrismaClient(): PrismaClient {
    if (globalForPrisma._prisma) {
        return globalForPrisma._prisma;
    }

    // Lazy import: only runs when actually called at request-time, never at build-time
    const { Pool } = require("pg") as typeof import("pg");
    const { PrismaPg } = require("@prisma/adapter-pg") as typeof import("@prisma/adapter-pg");

    const connectionString = (process.env.DATABASE_URL || "").trim();

    if (!connectionString) {
        throw new Error("DATABASE_URL environment variable is not set");
    }

    const pool = new Pool({ connectionString });
    const adapter = new PrismaPg(pool);
    const client = new PrismaClient({ adapter });

    if (process.env.NODE_ENV !== "production") {
        globalForPrisma._prisma = client;
    }

    return client;
}

export default getPrismaClient;
