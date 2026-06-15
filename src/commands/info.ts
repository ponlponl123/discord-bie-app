/**
 * @fileoverview Info command module.
 * Displays information about the bot, its runtime (Bun), resource usage, and active guild stats.
 */

import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import type { Command } from "../types.ts";

/**
 * Formats duration in milliseconds to a human-readable HH:MM:SS format.
 * @param milliseconds - The duration in milliseconds.
 * @returns A formatted string.
 */
function formatUptime(milliseconds: number): string {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [
    hours.toString().padStart(2, "0"),
    minutes.toString().padStart(2, "0"),
    seconds.toString().padStart(2, "0"),
  ].join(":");
}

export const info: Command = {
  data: new SlashCommandBuilder()
    .setName("info")
    .setDescription("Displays details about the bot runtime and statistics."),

  async execute(interaction) {
    const memory = process.memoryUsage();
    const rssMB = (memory.rss / 1024 / 1024).toFixed(2);
    const heapUsedMB = (memory.heapUsed / 1024 / 1024).toFixed(2);

    const uptime = formatUptime(process.uptime() * 1000);
    const bunVersion = Bun.version;
    const guildCount = interaction.client.guilds.cache.size;

    const embed = new EmbedBuilder()
      .setColor(0x5865f2) // Discord Blurple
      .setTitle("🤖 Bot Status & Statistics")
      .setDescription("A modularized, optimized, and lightweight Discord bot built on Bun.")
      .addFields(
        { name: "Runtime", value: `Bun v${bunVersion}`, inline: true },
        { name: "Uptime", value: uptime, inline: true },
        { name: "Servers Connected", value: `${guildCount}`, inline: true },
        { name: "Memory (RSS)", value: `${rssMB} MB`, inline: true },
        { name: "Heap Used", value: `${heapUsedMB} MB`, inline: true },
        { name: "Platform", value: `${process.platform} (${process.arch})`, inline: true }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
