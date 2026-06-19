/**
 * @fileoverview Interaction Create event router.
 * Detects the type of interaction and delegates execution to the appropriate modular sub-handler.
 */

import { Events } from "discord.js";
import type { BotEvent } from "../../types.ts";
import { handleChatInput } from "./handlers/chatInput.ts";

export const interactionCreate: BotEvent<Events.InteractionCreate> = {
  name: Events.InteractionCreate,
  async execute(interaction) {
    if (interaction.isChatInputCommand()) {
      await handleChatInput(interaction);
    }
  },
};
