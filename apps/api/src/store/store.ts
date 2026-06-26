// Storage backend factory.
//
// The store was refactored into a Repository interface (./repository) with two
// implementations: MemoryRepository (./memory) for development and
// PrismaRepository (./prisma) for PostgreSQL. The active backend is selected at
// startup by createRepository() below; routes depend only on the interface.
import type { Repository } from "./repository";
import { MemoryRepository } from "./memory";
import { PrismaRepository } from "./prisma";

/**
 * Selects the storage backend at startup.
 *
 * - When DATABASE_URL is set (and DATA_BACKEND is not "memory"), the
 *   PostgreSQL/Prisma repository is used.
 * - Otherwise the in-memory development repository is used.
 *
 * PrismaClient connects lazily (on first query), so importing PrismaRepository
 * does not require a live database unless a Postgres backend is selected.
 */
function createRepository(): Repository {
  const useDb =
    process.env.DATA_BACKEND === "prisma" ||
    (Boolean(process.env.DATABASE_URL) && process.env.DATA_BACKEND !== "memory");

  if (useDb) {
    console.log("[store] Using PrismaRepository (PostgreSQL)");
    return new PrismaRepository();
  }
  console.log("[store] Using MemoryRepository (development)");
  return new MemoryRepository();
}

export const store: Repository = createRepository();
