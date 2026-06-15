/**
 * @fileoverview Ready event handler.
 * Fires once when the client is logged in and ready.
 * Registers slash commands with the Discord gateway (globally or guild-specific).
 */

import { Events, REST, Routes } from "discord.js";
import { config } from "../config.ts";
import { tsflag } from "ts-better-console";
import { commands } from "../commands/index.ts";
import type { BotEvent } from "../types.ts";

export const ready: BotEvent<Events.ClientReady> = {
  name: Events.ClientReady,
  once: true,
  async execute(client) {
    console.log(
      tsflag("info", true, `Bot logged in successfully (Tag: ${client.user.tag}, ID: ${client.user.id})`)
    );

    const rest = new REST({ version: "10" }).setToken(config.token);

    try {
      const commandData = commands.map((cmd) => cmd.data.toJSON());

      if (config.targetServerId) {
        console.log(
          tsflag(
            "info",
            true,
            `Deploying guild-specific slash commands... (Guild: ${config.targetServerId}, Commands: ${commandData.length})`
          )
        );

        await rest.put(
          Routes.applicationGuildCommands(config.clientId, config.targetServerId),
          { body: commandData }
        );

        console.log(
          tsflag("info", true, `Guild-specific slash commands deployed successfully. (Guild: ${config.targetServerId})`)
        );
      } else {
        console.log(
          tsflag("info", true, `Deploying global slash commands... (Commands: ${commandData.length})`)
        );

        await rest.put(
          Routes.applicationCommands(config.clientId),
          { body: commandData }
        );

        console.log(tsflag("info", true, "Global slash commands deployed successfully."));
      }
    } catch (err) {
      console.error(tsflag("error", true, "Failed to register slash commands", err));
    }

    // Check and leave unauthorized servers
    if (config.targetServerId) {
      for (const [guildId, guild] of client.guilds.cache) {
        if (guildId !== config.targetServerId) {
          console.warn(
            tsflag("warn", true, `Joined unauthorized server "${guild.name}" (${guildId}). Leaving...`)
          );

          try {
            // Find a text channel to send goodbye message
            const systemChannel = guild.systemChannel;
            let targetChannel = null;

            if (systemChannel && systemChannel.permissionsFor(client.user)?.has("SendMessages")) {
              targetChannel = systemChannel;
            } else {
              targetChannel = guild.channels.cache.find(
                (channel) =>
                  channel.isTextBased() &&
                  channel.permissionsFor(client.user)?.has("SendMessages")
              );
            }

            if (targetChannel && targetChannel.isTextBased()) {
              await targetChannel.send("Goodbye! I am leaving this server as it is not my authorized server.");
            }

            await guild.leave();
            console.log(tsflag("info", true, `Successfully left server "${guild.name}" (${guildId})`));
          } catch (leaveErr) {
            console.error(tsflag("error", true, `Failed to leave server "${guild.name}" (${guildId}):`, leaveErr));
          }
        }
      }
    }
  },
};
