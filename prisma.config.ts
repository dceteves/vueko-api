import "dotenv/config";

import path from "path";
import { defineConfig } from "prisma/config";

// import { env } from 'prisma/config';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error("prisma.config.ts: DATABASE_URL not found");
}

export default defineConfig({
  schema: path.join("src", "prisma", "models"),
  migrations: {
    path: path.join("src", "prisma", "migrations"),
  },
  datasource: {
    url: DATABASE_URL,
  },
});
