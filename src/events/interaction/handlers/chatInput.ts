/**
 * @fileoverview Chat Input Command interaction handler.
 * Finds the requested command and executes it, handling errors gracefully.
 */

import { Collection, MessageFlags } from "discord.js";
import type { ChatInputCommandInteraction, InteractionReplyOptions } from "discord.js";
import { tsflag } from "ts-better-console";
import type { Command } from "../../../types.ts";

/**
 * Handles incoming ChatInputCommand (slash command) interactions.
 * @param interaction - The ChatInputCommandInteraction object.
 * @returns A promise that resolves when the command execution completes.
 */
export async function handleChatInput(interaction: ChatInputCommandInteraction): Promise<void> {
  const client = interaction.client as typeof interaction.client & {
    commands?: Collection<string, Command>;
  };

  const command = client.commands?.get(interaction.commandName);

  if (!command) {
    console.warn(
      tsflag(
        "warn",
        true,
        `Received interaction for unregistered command "/${interaction.commandName}" from user ${interaction.user.tag}`
      )
    );
    await interaction.reply({
      content: `Command "/${interaction.commandName}" is not registered.`,
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  try {
    console.log(
      tsflag(
        "debug",
        true,
        `Executing command "/${interaction.commandName}" for user ${interaction.user.tag} in guild ${interaction.guildId || "DM"}`
      )
    );

    await command.execute(interaction);
  } catch (err) {
    console.error(
      tsflag("error", true, `Error executing command "/${interaction.commandName}" for user ${interaction.user.tag}:`, err)
    );

    const errorMessage: InteractionReplyOptions = {
      content: "There was an error while executing this command!",
      flags: MessageFlags.Ephemeral,
    };

    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(errorMessage).catch((followUpErr) => {
        console.error(tsflag("error", true, "Failed to send error followUp message", followUpErr));
      });
    } else {
      await interaction.reply(errorMessage).catch((replyErr) => {
        console.error(tsflag("error", true, "Failed to send error reply message", replyErr));
      });
    }
  }
}
