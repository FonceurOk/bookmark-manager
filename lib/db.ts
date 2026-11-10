import { PrismaClient } from '@prisma/client';
// 💡 CORRECTION : "Sql" avec un s minuscule !
import { PrismaLibSql } from '@prisma/adapter-libsql'; 

const globalForPrisma = global as unknown as { prisma: PrismaClient };

// 💡 Correction ici aussi : new PrismaLibSql
const adapter = new PrismaLibSql({
  url: process.env.DATABASE_URL || "file:./prisma/dev.db",
});

export const prisma = globalForPrisma.prisma || new PrismaClient({ adapter });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;