import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    environment: "node",
    globals: false,
    setupFiles: ["./test/integration/setup.ts"],
    include: ["test/integration/**/*.test.ts"],
    testTimeout: 30000,
    hookTimeout: 30000,
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: ["src/**/*.ts"],
      exclude: [
        "src/**/*.d.ts",
        "src/index.ts",
        "src/dbTypes.ts",
        "src/global.d.ts",
      ],
      thresholds: {
        lines: 100,
        branches: 100,
      },
    },
  },
})
