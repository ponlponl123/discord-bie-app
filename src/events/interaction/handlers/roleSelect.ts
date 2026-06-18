/**
 * @fileoverview Role Selection interaction handler.
 * Toggles member roles based on select menu choices and responds ephemerally.
 */

import { MessageFlags } from "discord.js";
import type { StringSelectMenuInteraction } from "discord.js";
import { tsflag } from "ts-better-console";
import rolesData from "../../../config/roles.json";

/**
 * Handles incoming StringSelectMenu interactions for the role selection component.
 * @param interaction - The StringSelectMenuInteraction object.
 * @returns A promise that resolves when the role selection handling completes.
 */
export async function handleRoleSelect(interaction: StringSelectMenuInteraction): Promise<void> {
  if (!interaction.inGuild() || !interaction.guild) {
    await interaction.reply({
      content: "Roles can only be assigned within a server.",
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  // Defer reply ephemerally to prevent gateway timeout (3-second limit)
  await interaction.deferReply({ flags: MessageFlags.Ephemeral });

  try {
    const member = await interaction.guild.members.fetch(interaction.user.id);
    const selectedRoleIds = interaction.values;
    const targetRoleId = selectedRoleIds[0];

    if (!targetRoleId) {
      await interaction.editReply({ content: "No role was selected." });
      return;
    }
    
    const roles = rolesData.roles;
    const allowChangeBranch = rolesData.allowChangeBranch;
    const rolesMap = new Map(roles.map((role) => [role.id, role.label]));
    const allConfiguredRoleIds = roles.map((role) => role.id);
    
    // Check if the member currently has any of the configured branch roles
    const currentBranchRoleId = allConfiguredRoleIds.find((roleId) => member.roles.cache.has(roleId));

    if (currentBranchRoleId !== undefined && !allowChangeBranch) {
      await interaction.editReply({
        content:
          "🇹🇭 ⚠️ คุณสามารถเลือกสาขา/คณะได้เพียงครั้งเดียวเท่านั้น และไม่สามารถเปลี่ยนแปลงหรือนำบทบาทออกได้\n" +
          "🇨🇳 ⚠️ 你只能选择一次专业/学院，且无法更改或移除此身份组。\n" +
          "🇺🇸 ⚠️ You can only select your branch/facility once and cannot change or remove it.",
      });
      return;
    }

    const roleLabel = rolesMap.get(targetRoleId) || `Unknown Role (${targetRoleId})`;
    const role = interaction.guild.roles.cache.get(targetRoleId);

    if (!role) {
      await interaction.editReply({
        content: `⚠️ **Failed**: ${roleLabel} (Role not found in server)`,
      });
      return;
    }

    const added: string[] = [];
    const removed: string[] = [];

    if (member.roles.cache.has(targetRoleId)) {
      // Toggle off if they select their current role (only reached if allowChangeBranch is true)
      await member.roles.remove(role);
      removed.push(roleLabel);
    } else {
      // Add the new role
      await member.roles.add(role);
      added.push(roleLabel);

      // Remove any other configured branch roles they currently have (only reached if allowChangeBranch is true)
      for (const otherRoleId of allConfiguredRoleIds) {
        if (otherRoleId !== targetRoleId && member.roles.cache.has(otherRoleId)) {
          const otherRole = interaction.guild.roles.cache.get(otherRoleId);
          if (otherRole) {
            try {
              await member.roles.remove(otherRole);
              removed.push(rolesMap.get(otherRoleId) || otherRoleId);
            } catch (removeErr) {
              console.error(
                tsflag("error", true, `Failed to remove old role ${otherRoleId} for user ${interaction.user.tag}:`, removeErr)
              );
            }
          }
        }
      }
    }

    const responseParts: string[] = [];
    if (added.length > 0) {
      responseParts.push(`✅ **Added**: ${added.join(", ")}`);
    }
    if (removed.length > 0) {
      responseParts.push(`❌ **Removed**: ${removed.join(", ")}`);
    }

    const responseContent = responseParts.length > 0
      ? responseParts.join("\n")
      : "No changes were made.";

    await interaction.editReply({
      content: responseContent,
    });
  } catch (err) {
    console.error(
      tsflag("error", true, `Failed to process role selection for user ${interaction.user.tag}:`, err)
    );
    await interaction.editReply({
      content: "An error occurred while processing your role selection.",
    });
  }
}
