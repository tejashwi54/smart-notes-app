import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./src",
  timeout: 60000,
  expect: {
    timeout: 5000,
  },
  use: {
    baseURL: "http://localhost:5173",
    headless: true,
  },
});