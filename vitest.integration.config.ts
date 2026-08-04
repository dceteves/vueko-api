import { loadEnv } from "vite";
import { defineConfig } from "vitest/config";

export default defineConfig(({ mode }) => ({
  test: {
    env: loadEnv(mode, process.cwd(), ""),
    globals: true,
    environment: "node",
    setupFiles: "./test/integration/setup.ts",
    include: ["test/integration/**/*.test.ts"],
    reporters: ["verbose"],
    pool: "forks",
    singleFork: true,
  },
}));
