/**
 * @fileoverview Help command module.
 * Lists all registered commands dynamically from the client command cache.
 */

import { Collection, EmbedBuilder, MessageFlags, SlashCommandBuilder } from "discord.js";
import type { Command } from "../types.ts";

export const help: Command = {
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("Lists all available commands for the bot."),

  async execute(interaction) {
    // Cast client to access the dynamically loaded commands collection
    const client = interaction.client as typeof interaction.client & {
      commands?: Collection<string, Command>;
    };

    const commands = client.commands;

    if (!commands || commands.size === 0) {
      await interaction.reply({
        content: "No commands registered in the client commands collection.",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const commandList = commands
      .map((cmd) => `**/${cmd.data.name}**\n${cmd.data.description}`)
      .join("\n\n");

    const embed = new EmbedBuilder()
      .setColor(0x5865f2) // Discord Blurple
      .setTitle("📚 Command List")
      .setDescription(
        "Here are the commands you can use with this bot:\n\n" + commandList
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
