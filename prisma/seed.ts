// CLI seed entrypoint. Run: npm run seed  (or npm run reset)
import { PrismaClient } from "@prisma/client";
import { seedDemo } from "../src/lib/seed";

const prisma = new PrismaClient();

seedDemo(prisma)
  .then((r) => console.log("✔ Seed complete:", r))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
