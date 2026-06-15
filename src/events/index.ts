/**
 * @fileoverview Event aggregator module.
 * Imports all bot events and exports them in a single array.
 */

import { ready } from "./ready.ts";
import { interactionCreate } from "./interaction/create.ts";
import { guildCreate } from "./guild/create.ts";
import type { BotEvent } from "../types.ts";

/**
 * Array of all event handlers registered by the bot.
 */
export const events: readonly BotEvent<any>[] = [
  ready,
  interactionCreate,
  guildCreate,
];
