import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import { PrismaClient } from "../src/generated/prisma/client";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const p = new PrismaClient({ adapter });

const IMAGE_URL =
  "https://drive.google.com/thumbnail?id=1FrLki5RnkHCdoKvQggZ3sB3q4igh5ISy&sz=w400";
const ADMIN_EMAIL = "programmer.zunaid@gmail.com";

async function main() {
  const updated = await p.user.update({
    where: { email: ADMIN_EMAIL },
    data: { image: IMAGE_URL },
    select: { name: true, email: true, image: true },
  });
  console.log("✅ Updated:", JSON.stringify(updated, null, 2));
}

main()
  .catch((e) => {
    console.error("❌ Error:", e.message);
    process.exit(1);
  })
  .finally(() => {
    pool.end();
  });
