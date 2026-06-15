/**
 * @fileoverview Guild Create event handler.
 * Fires whenever the bot joins a guild.
 * Checks if the guild is authorized, otherwise sends a goodbye message and leaves.
 */

import { Events } from "discord.js";
import { tsflag } from "ts-better-console";
import { config } from "../../config.ts";
import type { BotEvent } from "../../types.ts";

export const guildCreate: BotEvent<Events.GuildCreate> = {
  name: Events.GuildCreate,
  async execute(guild) {
    if (!config.targetServerId || guild.id === config.targetServerId) {
      return;
    }

    console.warn(
      tsflag("warn", true, `Joined unauthorized server "${guild.name}" (${guild.id}). Leaving...`)
    );

    try {
      const clientUser = guild.client.user;
      if (!clientUser) {
        return;
      }

      // Find a text channel to send goodbye message
      const systemChannel = guild.systemChannel;
      let targetChannel = null;

      if (systemChannel && systemChannel.permissionsFor(clientUser)?.has("SendMessages")) {
        targetChannel = systemChannel;
      } else {
        targetChannel = guild.channels.cache.find(
          (channel) =>
            channel.isTextBased() &&
            channel.permissionsFor(clientUser)?.has("SendMessages")
        );
      }

      if (targetChannel && targetChannel.isTextBased()) {
        await targetChannel.send("Goodbye! I am leaving this server as it is not my authorized server.");
      }

      await guild.leave();
      console.log(tsflag("info", true, `Successfully left server "${guild.name}" (${guild.id})`));
    } catch (err) {
      console.error(tsflag("error", true, `Failed to leave server "${guild.name}" (${guild.id}):`, err));
    }
  },
};
