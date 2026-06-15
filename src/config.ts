/**
 * @fileoverview Configuration module.
 * Loads and validates environment variables required to run the bot.
 */

export interface Config {
  readonly token: string;
  readonly clientId: string;
  readonly targetServerId: string | null;
}

/**
 * Validates and loads the environment configuration.
 * @returns {Config} The validated configuration object.
 * @throws {Error} If required environment variables are missing.
 */
function loadConfig(): Config {
  const token = Bun.env.DISCORD_TOKEN;
  const clientId = Bun.env.DISCORD_CLIENT_ID;
  const targetServerId = Bun.env.DISCORD_TARGET_SERVER || null;

  if (!token) {
    throw new Error("Missing required environment variable: DISCORD_TOKEN");
  }

  if (!clientId) {
    throw new Error("Missing required environment variable: DISCORD_CLIENT_ID");
  }

  return {
    token,
    clientId,
    targetServerId,
  };
}

export const config = loadConfig();
