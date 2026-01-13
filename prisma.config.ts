import "dotenv/config";
import path from "path";
import type { PrismaConfig } from "prisma";
import { env } from 'prisma/config';

export default {
  // schema: 'prisma/schema.prisma',
  schema: path.join("src", "prisma", "models"),
  migrations: { 
    path: path.join("src", "prisma", "migrations"),
  },
  datasource: {
    url: env('DATABASE_URL')
  },
} satisfies PrismaConfig;
