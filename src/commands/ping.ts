/**
 * @fileoverview Ping command module.
 * Measures and returns the bot latency and API latency.
 */

import { SlashCommandBuilder } from "discord.js";
import type { Command } from "../types.ts";

export const ping: Command = {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Replies with Pong and latency information!"),

  async execute(interaction) {
    await interaction.reply({
      content: "Pinging...",
    });
    const sent = await interaction.fetchReply();

    const latency = sent.createdTimestamp - interaction.createdTimestamp;
    const apiPing = interaction.client.ws.ping;

    await interaction.editReply(
      `Pong! 🏓\n- **Bot Latency**: ${latency}ms\n- **API Latency**: ${apiPing}ms`
    );
  },
};
