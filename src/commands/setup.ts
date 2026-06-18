/**
 * @fileoverview Admin setup command.
 * Configures and deploys various server interactive panels (like role selection).
 */

import {
  ActionRowBuilder,
  EmbedBuilder,
  MessageFlags,
  PermissionFlagsBits,
  SlashCommandBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
} from "discord.js";
import type { Command } from "../types.ts";
import rolesData from "../config/roles.json";

interface RoleConfig {
  id: string;
  label: string;
  description?: string;
  emoji?: string;
}

const roles: RoleConfig[] = rolesData.roles as RoleConfig[];

export const setup: Command = {
  data: new SlashCommandBuilder()
    .setName("setup")
    .setDescription("Configure setup panels for the server.")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addStringOption((option) =>
      option
        .setName("module")
        .setDescription("The setup module to deploy")
        .setRequired(true)
        .addChoices({ name: "Role Selection", value: "role-selection" })
    ),

  async execute(interaction) {
    const moduleType = interaction.options.getString("module", true);

    if (moduleType === "role-selection") {
      const channel = interaction.channel;
      if (!channel || !("send" in channel)) {
        await interaction.reply({
          content: "Could not find a valid text channel to deploy the role selection panel.",
          flags: MessageFlags.Ephemeral,
        });
        return;
      }

      const allowChangeBranch = rolesData.allowChangeBranch;

      const embed = new EmbedBuilder()
        .setColor(0x5865f2) // Discord Blurple
        .setTitle("🎭 เลือกสาขา / คณะ")
        .setDescription("กรุณาเลือกสาขาหรือคณะของคุณจากเมนูด้านล่างนี้เพื่อรับบทบาทประจำตัวของคุณ")
        .setTimestamp();

      if (allowChangeBranch) {
        embed.setFooter({ text: "ℹ️ คุณสามารถกดเปลี่ยนหรือยกเลิกบทบาทได้ตลอดเวลา" });
      } else {
        embed.setFooter({ text: "⚠️ เลือกได้เพียงครั้งเดียวเท่านั้น ไม่สามารถเปลี่ยนแปลงหรือยกเลิกได้" });
      }

      const selectMenu = new StringSelectMenuBuilder()
        .setCustomId("role_select_menu")
        .setPlaceholder("เลือกสาขา / คณะของคุณที่นี่...")
        .setMinValues(1)
        .setMaxValues(1)
        .addOptions(
          roles.map((role) => {
            const option = new StringSelectMenuOptionBuilder()
              .setLabel(role.label)
              .setValue(role.id);

            if (role.description) {
              option.setDescription(role.description);
            }
            if (role.emoji) {
              option.setEmoji(role.emoji);
            }
            return option;
          })
        );

      const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMenu);

      // Send the panel as a regular message directly to the channel to hide the slash command
      await channel.send({
        embeds: [embed],
        components: [row],
      });

      // Confirm success ephemerally to the administrator
      await interaction.reply({
        content: "✅ Successfully deployed the role selection panel to this channel.",
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};
