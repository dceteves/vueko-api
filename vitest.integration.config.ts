import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    envFile: ".env.test",
    globals: true,
    environment: "node",
    setupFiles: "./test/integration/setup.ts",
    include: ["test/integration/**/*.test.ts"],
    reporters: ["verbose"],
    pool: "forks",
    singleFork: true,
  },
});
