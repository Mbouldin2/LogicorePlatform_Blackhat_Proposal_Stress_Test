import "server-only";
import { PrismaClient } from "@prisma/client";
import { isDatabaseConfigured } from "./config";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

/** Returns a singleton PrismaClient, or `null` when no DATABASE_URL is set.
 *  Callers MUST handle the null case (demo mode). Constructing the client is
 *  deferred until a database is actually configured so demo mode never touches
 *  Postgres. */
export function getPrisma(): PrismaClient | null {
  if (!isDatabaseConfigured()) return null;
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = new PrismaClient({
      log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    });
  }
  return globalForPrisma.prisma;
}
