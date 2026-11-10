import pkg from '@prisma/client';
const { PrismaClient } = pkg;
// 💡 CORRECTION : "Sql" avec un s minuscule !
import { PrismaLibSql } from '@prisma/adapter-libsql'; 
import bcrypt from 'bcryptjs';
import "dotenv/config";

// 💡 Correction ici aussi : new PrismaLibSql
const adapter = new PrismaLibSql({
  url: process.env.DATABASE_URL || "file:./prisma/dev.db",
});

const prisma = new PrismaClient({ adapter });

async function main() {
  const hashedPassword = await bcrypt.hash('password', 10);

  const user = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      name: 'Test User',
      password: hashedPassword,
    },
  });

  await prisma.bookmark.createMany({
    data: [
      { title: 'Next.js Framework', url: 'https://nextjs.org', userId: user.id },
      { title: 'Prisma ORM', url: 'https://prisma.io', userId: user.id },
      { title: 'Tailwind CSS', url: 'https://tailwindcss.com', userId: user.id },
    ],
  });

  console.log("✅ Base SQLite initialisée et peuplée avec succès !");
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });