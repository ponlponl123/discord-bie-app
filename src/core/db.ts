/**
 * @fileoverview Database core module.
 * Initializes the Prisma client for application-wide database interactions using a driver adapter.
 */

import { PrismaClient } from "../generated/prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { tsflag } from "ts-better-console";

const databaseUrl = process.env["DATABASE_URL"];

if (!databaseUrl) {
  const errorMsg = "DATABASE_URL environment variable is not defined.";
  console.error(tsflag("error", true, errorMsg));
  throw new Error(errorMsg);
}

// In Prisma 7, driver adapters must be used to execute queries via JavaScript-native drivers.
const adapter = new PrismaMariaDb(databaseUrl);

/**
 * Shared instance of the PrismaClient.
 * This should be imported and reused across the application to avoid exceeding the database connection limit.
 */
export const prisma: PrismaClient = new PrismaClient({ adapter });

/**
 * Establishes and verifies connection to the database.
 * @returns A promise that resolves when the database connection is successfully verified.
 * @throws An error if connection verification fails.
 */
export async function connectDb(): Promise<void> {
  try {
    console.log(tsflag("info", true, "Connecting to database..."));
    await prisma.$connect();
    console.log(tsflag("info", true, "Database connection successfully established."));
  } catch (err) {
    console.error(tsflag("error", true, "Failed to establish database connection", err));
    throw err;
  }
}
