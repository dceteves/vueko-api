import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    setupFiles: "./test/integration/setup.ts",
    include: ["test/**/*.test.ts"],
    reporters: ["verbose"],
  },
});
