/**
 * @fileoverview Main entry point of the Discord bot.
 * Initializes the client, registers commands and events, and logs into Discord.
 */

import { Client, Collection, GatewayIntentBits } from "discord.js";
import { config } from "./config.ts";
import { tsflag } from "ts-better-console";
import { commands } from "./commands/index.ts";
import { events } from "./events/index.ts";
import type { Command } from "./types.ts";

// Set up process-wide exception handling using structured logging
process.on("unhandledRejection", (reason) => {
  console.error(tsflag("error", true, "Unhandled promise rejection encountered", reason));
});

process.on("uncaughtException", (err) => {
  console.error(tsflag("error", true, "Uncaught exception encountered", err));
});

/**
 * Initializes and starts the Discord bot.
 */
async function startBot(): Promise<void> {
  console.log(tsflag("info", true, "Initializing Discord client..."));

  // Initialize client with minimal intents for optimal resource utilization
  const client = new Client({
    intents: [GatewayIntentBits.Guilds],
  }) as Client & { commands: Collection<string, Command> };

  // Register commands to the client collection
  client.commands = new Collection<string, Command>();
  for (const command of commands) {
    client.commands.set(command.data.name, command);
  }

  // Register bot events
  for (const event of events) {
    if (event.once) {
      client.once(event.name, (...args) => event.execute(...args));
    } else {
      client.on(event.name, (...args) => event.execute(...args));
    }
  }

  // Log in to Discord gateway
  console.log(tsflag("info", true, "Connecting to Discord..."));
  await client.login(config.token);
}

// Bootstrap the application
startBot().catch((err) => {
  console.error(tsflag("error", true, "Fatal startup error, terminating process", err));
  process.exit(1);
});