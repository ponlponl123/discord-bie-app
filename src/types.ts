/**
 * @fileoverview Type definitions for modular discord bot command and event handlers.
 */

import type {
  ChatInputCommandInteraction,
  ClientEvents,
  SlashCommandBuilder,
  SlashCommandSubcommandsOnlyBuilder,
} from "discord.js";

/**
 * Interface representing a slash command.
 */
export interface Command {
  /**
   * The Discord slash command builder data.
   */
  readonly data:
    | SlashCommandBuilder
    | SlashCommandSubcommandsOnlyBuilder
    | Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">;

  /**
   * Executes the command when triggered by a user.
   * @param interaction - The ChatInputCommandInteraction object.
   * @returns A promise that resolves when execution finishes.
   */
  readonly execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
}

/**
 * Interface representing a client event handler.
 */
export interface BotEvent<K extends keyof ClientEvents = keyof ClientEvents> {
  /**
   * The name of the event as defined in discord.js ClientEvents.
   */
  readonly name: K;

  /**
   * Whether the event should only run once.
   */
  readonly once?: boolean;

  /**
   * Event handler execution logic.
   * @param args - Arguments matching the specific Discord event.
   * @returns A promise that resolves when the event logic is handled.
   */
  readonly execute: (...args: ClientEvents[K]) => Promise<void>;
}
