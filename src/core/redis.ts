/**
 * @fileoverview Redis core module.
 * Configures and initializes the Redis client for caching and shared state using a Redis Sentinel cluster.
 */

import Redis from "ioredis";
import { tsflag } from "ts-better-console";

const isDev = process.env["NODE_ENV"] === "development";

// Parse environment sentinels from REDIS_SENTINEL_HOSTS (comma-separated list of host:port)
const sentinelHosts = (process.env["REDIS_SENTINEL_HOSTS"] || "")
  .split(",")
  .filter((entry) => entry.trim() !== "")
  .map((entry) => {
    const [host, port] = entry.split(":");
    return {
      host: host || "127.0.0.1",
      port: port ? parseInt(port, 10) : 26379,
    };
  });

/**
 * Configured Redis Client connected to the Sentinel cluster.
 * 
 * Includes dynamic NAT mapping for development:
 * If in development mode and Sentinel reports an internal Docker IP (starts with "172."),
 * the client maps it back to "127.0.0.1" so the host machine can connect.
 */
export const redisClient: Redis = new Redis({
  sentinels: sentinelHosts.length > 0 ? sentinelHosts : undefined,
  name: process.env["REDIS_SENTINEL_NAME"] || "mymaster",
  password: process.env["REDIS_PASSWORD"] || undefined,
  sentinelPassword: process.env["REDIS_SENTINEL_PASSWORD"] || undefined,
  /**
   * Dynamic NAT mapping for development.
   * Sentinel may return docker internal IPs (172.x.x.x) which the host cannot resolve directly.
   * Maps them back to localhost.
   */
  natMap: isDev
    ? (address: string) => {
        const [ip, port] = address.split(":");
        if (ip && ip.startsWith("172.") && port) {
          return { host: "127.0.0.1", port: parseInt(port, 10) };
        }
        return null;
      }
    : undefined,
});

// Bind connection life-cycle event listeners for structured logging
redisClient.on("connect", () => {
  console.log(tsflag("info", true, "Connecting to Redis Sentinel..."));
});

redisClient.on("ready", () => {
  console.log(tsflag("info", true, "Redis client connection successfully established and ready."));
});

redisClient.on("error", (err: unknown) => {
  console.error(tsflag("error", true, "Redis client error encountered", err));
});

redisClient.on("reconnecting", (delay: number) => {
  console.warn(tsflag("warn", true, `Redis client reconnecting in ${delay}ms...`));
});

redisClient.on("end", () => {
  console.warn(tsflag("warn", true, "Redis client connection has ended."));
});
