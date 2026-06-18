/**
 * @fileoverview Command aggregator module.
 * Imports all commands and exports them in a clean structure.
 */

import { ping } from "./ping.ts";
import { info } from "./info.ts";
import { help } from "./help.ts";
import { setup } from "./setup.ts";
import type { Command } from "../types.ts";

/**
 * Array of all slash commands supported by the bot.
 */
export const commands: readonly Command[] = [
  ping,
  info,
  help,
  setup,
];
