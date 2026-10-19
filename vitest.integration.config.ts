import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Integration tests hit the real dev Supabase project; env comes from .env.local
// (loaded in tests/integration/setup.ts). No unit-test setup file here.
export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: {
    environment: "node",
    include: ["tests/integration/**/*.test.ts"],
    testTimeout: 30000,
    hookTimeout: 30000,
    fileParallelism: false,
  },
});
