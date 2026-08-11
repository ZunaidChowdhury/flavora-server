import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import { PrismaClient } from "../src/generated/prisma/client";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const p = new PrismaClient({ adapter });

async function main() {
  console.log("Connecting to database using:", process.env.DATABASE_URL);
  const count = await p.category.count();
  console.log("✅ Success! Category count:", count);
}

main()
  .catch((e) => {
    console.error("❌ Connection failed:", e);
    process.exit(1);
  })
  .finally(() => {
    pool.end();
  });
