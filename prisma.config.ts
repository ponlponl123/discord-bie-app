/**
 * @fileoverview Prisma configuration module.
 * Defines the Prisma schema location and database connection URL for Prisma CLI commands.
 * Automatically loads .env.local variables to ensure seamless development setup.
 */

import fs from "node:fs";
import path from "node:path";
import { defineConfig, env } from "prisma/config";

// Read and parse .env.local file if it exists, to support development environment variables
try {
  const envLocalPath = path.resolve(process.cwd(), ".env.local");
  if (fs.existsSync(envLocalPath)) {
    const envContent = fs.readFileSync(envLocalPath, "utf8");
    for (const line of envContent.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith("#")) {
        const index = trimmed.indexOf("=");
        if (index !== -1) {
          const key = trimmed.slice(0, index).trim();
          let val = trimmed.slice(index + 1).trim();
          // Strip enclosing quotes if present
          if (
            (val.startsWith('"') && val.endsWith('"')) ||
            (val.startsWith("'") && val.endsWith("'"))
          ) {
            val = val.slice(1, -1);
          }
          process.env[key] = val;
        }
      }
    }
  }
} catch (err) {
  // Fallback to existing process.env variables if loading fails
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: env("DATABASE_URL"),
  },
});
