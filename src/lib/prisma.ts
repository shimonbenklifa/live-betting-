import { PrismaClient } from "@prisma/client";

/**
 * Prisma singleton. Only instantiated when DATABASE_URL is present; in demo
 * mode the data layer never touches this. Reused across hot reloads in dev.
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"]
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
