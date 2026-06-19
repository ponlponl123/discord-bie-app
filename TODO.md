# Contributor TODO List & Roadmap

Welcome to the **discord-wumpus-app** contributor list! This document outlines upcoming features, technical requirements, and architectural guides to help you build and maintain features for our private community bot.

---

## Architectural Guidelines

To keep the codebase maintainable, fast, and scalable, all features must adhere to these design principles:

1. **TypeScript Strict Mode**: Never use `any`. Explicitly type all variables, function arguments, and return types.
2. **Functional Paradigm**: Prefer exportable objects, factory functions, and pure logic. Avoid classes unless absolutely necessary or required by third-party APIs.
3. **Structured Logging**: Use `tsflag` from `ts-better-console` for logging. Do not use raw `console.log`.
4. **State Persistence**: For features that require state, use **Prisma ORM with MariaDB** (using the `mysql` provider). Define and update schemas inside the `prisma/schema.prisma` file.
5. **Core Directory**: Place important app infrastructure utilities (like database connections, cache clients, etc.) inside the `src/core/` directory.
6. **Discord.js Best Practices**:
   - Use interaction components (Buttons, Select Menus) for user interactions instead of text-based triggers where possible.
   - Always defer/reply to interactions within the 3-second limit.
   - Return ephemeral responses for personal/admin configuration commands to prevent channel clutter.
   - **Bot Restart Survival**: Action components (buttons, select menus, etc.) must have **static/persistent** custom IDs. Avoid dynamic/random IDs so that handlers can recognize the interactions even after a bot reboot.

---

## Database Setup & Initialization

To get started with the database features:

- [x] **Install Prisma & Client**
  - Run:
    ```bash
    bun add @prisma/client
    bun add -d prisma
    ```
- [x] **Initialize Prisma Schema**
  - Run `npx prisma init` to generate files.
  - Configure the provider in `prisma/schema.prisma`:
    ```prisma
    datasource db {
      provider = "mysql"
      url      = env("DATABASE_URL")
    }
    ```
  - Define `DATABASE_URL="mysql://user:password@localhost:3306/dbname"` in `.env.local`.
- [x] **Generate Client**
  - Define your models and run:
    ```bash
    npx prisma db push
    npx prisma generate
    ```
- [x] **Setup Prisma Client Wrapper**
  - Initialize the Prisma client once and export it inside `src/core/db.ts` (or `src/core/prisma.ts`) so it can be reused across the application:
    ```typescript
    import { PrismaClient } from "@prisma/client";

    export const prisma = new PrismaClient();
    ```

---

## Redis Sentinel Configuration

To set up cache/shared state using a Redis Sentinel cluster:

- [x] **Install Redis Client**
  - Install `ioredis` (includes built-in TypeScript definitions):
    ```bash
    bun add ioredis
    ```
- [x] **Define Environment Variables**
  - In `.env.local`, specify sentinel details and connection flags:
    ```bash
    REDIS_SENTINEL_HOSTS="127.0.0.1:26379,127.0.0.1:26380" # comma-separated list
    REDIS_SENTINEL_NAME="mymaster"
    NODE_ENV="development" # or "production"
    ```
- [x] **Implement Client with Host NAT Mapping for Development**
  - When running locally in a dev environment (`NODE_ENV === "development"`), the Sentinel node returns the internal docker network IPs of the Redis master/slaves (e.g. `172.x.x.x`). The host machine cannot reach these directly unless they are NATed back to localhost (`127.0.0.1`).
  - Implement this connection logic inside `src/core/redis.ts`:
    ```typescript
    import Redis from "ioredis";

    const isDev = process.env.NODE_ENV === "development";

    // Parse environment sentinels
    const sentinelHosts = (process.env.REDIS_SENTINEL_HOSTS || "")
      .split(",")
      .map((entry) => {
        const [host, port] = entry.split(":");
        return { host, port: parseInt(port, 10) || 26379 };
      });

    export const redisClient = new Redis({
      sentinels: sentinelHosts,
      name: process.env.REDIS_SENTINEL_NAME || "mymaster",
      /**
       * Dynamic NAT mapping for development.
       * If we are in dev mode, Sentinel reports internal docker IPs (starting with "172.").
       * Map those IPs back to 127.0.0.1 so the local server on the host machine can connect.
       */
      natMap: isDev
        ? (address: string) => {
            const [ip, port] = address.split(":");
            if (ip.startsWith("172.")) {
              return { host: "127.0.0.1", port: parseInt(port, 10) };
            }
            return undefined;
          }
        : undefined,
    });
    ```

---

## Current Roadmap & Features

### 1. Interactive Role Selection [DEPRECATED - Moved to Discord Onboarding]
~~**Goal:** Allow members to self-assign profile/topic roles (e.g., "com-sci", "med-sci", "ai") using interactive Discord select menus.~~

- [x] ~~**Define configuration schema**~~
  - ~~Create a JSON or Prisma configuration model to store eligible role IDs, custom emojis, descriptions, and labels.~~
- [x] ~~**Create Admin Setup Command**~~
  - ~~Command: `/setup` with a string option choice `role-selection:your-branch` (restricted to Administrators).~~
  - ~~Logic: Generates a beautiful Discord Embed with a `StringSelectMenuBuilder` listing the configurable roles.~~
  - ~~**Bot Restart Survival**: The select menu component must have a **static/persistent** custom ID (e.g., `role_select_menu`). Do not generate random custom IDs.~~
- [x] ~~**Implement Interaction Handler**~~
  - ~~Listen to `InteractionCreate` events.~~
  - ~~Detect selection of role menu options by checking for the static custom ID (e.g., `interaction.customId === "role_select_menu"`).~~
  - ~~Toggle roles: Add the role if the member doesn't have it; remove it if they do.~~
  - ~~Respond with an ephemeral confirmation message: *"Added/Removed role: X"*.~~

---

### 2. Server Rename with Approval Queue (12-Hour Auto-Approval) [REJECTED]
~~**Goal:** Democratize server naming by letting anyone suggest a new server name, while providing a safety mechanism via moderator approval or a 12-hour timeout.~~

- [ ] ~~**Define Prisma Model**~~
  - ~~Add to `schema.prisma`:~~
    ```prisma
    model PendingRename {
      id           Int      @id @default(autoincrement())
      requesterId  String
      proposedName String   @db.VarChar(100)
      requestTime  DateTime @default(now())
      status       String   @default("pending") // "pending", "approved", "rejected", "auto_approved"
      adminMsgId   String
    }
    ```
- [ ] ~~**Create Suggestion Command**~~
  - ~~Command: `/rename-server <new-name>` (available to everyone).~~
  - ~~Logic: Check if there is already a pending rename request. If yes, inform the user they must wait. Validate length (< 100 characters). Save the request to the database.~~
- [ ] ~~**Implement Admin Approval Interface**~~
  - ~~Send an Embed message to a designated moderator/admin channel.~~
  - ~~Include details: requester, proposed name, time remaining.~~
  - ~~Attach two buttons: "Approve" (Green) and "Reject" (Red). Use static custom IDs (e.g., `rename_approve` and `rename_reject`).~~
- [ ] ~~**Handle Button Interactions**~~
  - ~~Listen for button clicks from authorized moderators (`ManageGuild` or `Administrator` permissions) by matching the static custom IDs.~~
  - ~~If **Approve**: Rename guild immediately (`guild.setName`), set status to 'approved', update the embed to show *"Approved by @Admin"*, and disable the buttons.~~
  - ~~If **Reject**: Set status to 'rejected', update the embed to show *"Rejected by @Admin"*, and disable the buttons.~~
- [ ] ~~**Implement Background Scheduler**~~
  - ~~Write a periodic check (e.g., checking every 10–30 minutes or running on startup) that queries the database for pending requests older than 12 hours.~~
  - ~~If a request is expired: Auto-approve, execute `guild.setName`, update database status to `auto_approved`, update admin embed to *"Auto-approved after 12 hours"*, and disable buttons.~~

---

### 3. Configurable Temporary Personal Channels
**Goal:** Allow members to spin up their own temporary channels (Voice, Text, or Both) which are automatically cleaned up when empty or inactive.

- [ ] **Define Prisma Model**
  - Add to `schema.prisma`:
    ```prisma
    model TemporaryChannel {
      channelId   String   @id
      creatorId   String
      channelType String   // "vc", "text", "both"
      createdAt   DateTime @default(now())
    }
    ```
- [ ] **Create Creation Command**
  - Command: `/tempchannel create <name> [type: vc/text/both]`
  - Logic: Validate that the user hasn't exceeded the maximum channels limit (default: 1 vc). Create the channel under a designated category using `guild.channels.create`. Give the creator permissions to manage/configure their temporary channel (e.g., mute, rename, kick). Save to database.
- [ ] **Implement Voice Channel Cleanup Handler**
  - Listen to `voiceStateUpdate` events.
  - If a voice channel in `TemporaryChannel` has 0 members remaining, delete the channel, remove it from the database, and log the action.
- [ ] **Implement Text Channel Cleanup Handler**
  - Run a daily or periodic check to delete temporary text channels with no activity for a configurable threshold (e.g., 24 hours).

---

### 4. User Guilds System (Custom Hoisted Roles)
**Goal:** Allow members to create a custom group/guild (max 1 guild per member) which automatically manages a dedicated Discord role. If a guild accumulates more than 10 members, the role is hoisted (shown separately in the member list).

- [ ] **Define Prisma Models**
  - Add to `schema.prisma` (a user can be in at most 1 guild at a time):
    ```prisma
    model Guild {
      id        Int           @id @default(autoincrement())
      name      String        @unique @db.VarChar(100)
      ownerId   String        @unique
      roleId    String        @unique
      createdAt DateTime      @default(now())
      members   GuildMember[]
    }

    model GuildMember {
      id       Int      @id @default(autoincrement())
      guildId  Int
      userId   String   @unique
      joinedAt DateTime @default(now())
      guild    Guild    @relation(fields: [guildId], references: [id], onDelete: Cascade)
    }
    ```
- [ ] **Create Slash Command System**
  - Command: `/guild create <name>`
    - Logic: Check if the user is already in a guild (as owner or member). Create a Discord role matching `<name>` (`hoist: false`). Save the guild and owner as a member to the database. Assign the role.
  - Command: `/guild setting <name | color> <value>`
    - Logic: Check if the user is the owner of a guild. Update the custom role's name or color (hex code) on Discord and update the DB record.
  - Command: `/guild invite <member>`
    - Logic: Check if the executor is the owner. Validate that the target member is not already in any guild. Send an interactive message to the target member with **Accept** (Green) and **Decline** (Red) buttons. Use static custom IDs (e.g., `guild_invite_accept:<userId>` or `guild_invite_decline:<userId>`) to process the choice correctly even after a bot restart. If accepted, add them to the guild role and the database, then trigger hoisting checks.
  - Command: `/guild kick <member>`
    - Logic: Check if the executor is the owner. Verify the target is in their guild. Remove the role, delete their member record, and trigger hoisting checks.
  - Command: `/guild leave`
    - Logic: Allow a member to leave their guild (removes role and DB entry, checks hoisting).
  - Command: `/guild disband`
    - Logic: Check if the executor is the owner. Deletes the Discord role, cascades deletion of all membership records, and removes the guild database entry.
  - Command: `/join <owner>`
    - Logic: Available to members who are not currently in any guild. Directly joins the guild owned by `<owner>` (assigns role, adds to database, and triggers hoisting checks).
- [ ] **Implement Auto-Hoisting Logic**
  - Create a utility function `checkGuildHoisting(guildId: number, guild: Guild)`:
    - Count the number of active members in the guild (both owner and members).
    - If member count > 10: Set the custom Discord role to `hoist: true` (separates in member list).
    - If member count <= 10: Set the custom Discord role to `hoist: false`.
  - Trigger this utility on every join, leave, invite accept, and kick event.

---

## Future Fun & Peaceful Features (Roadmap)

To foster a peaceful, positive, and engaging server culture, contributors are encouraged to claim and implement the following ideas:

### 🧘 Zen Focus Rooms
A productivity tool for friends studying or working together.
* **Concept:** A designated voice channel that, when joined, triggers a Pomodoro-style timer via DM. The bot can automatically mute the user's view of other busy chat channels to avoid distraction.
* **Rewards:** Earn "Focus Points" or study badges for hitting milestones (e.g., 25/50 minutes of continuous focus).

### 🌸 Daily Gratitude Check-ins
A routine to spread positive vibes.
* **Concept:** Every morning, the bot posts a daily prompt in a `#gratitude` channel (e.g., *"What is one good thing that happened yesterday?"* or *"Share a small win!"*).
* **Peace score:** Users can reply, and the bot maintains a friendly streak/karma counter to reward consistent contributors with colorful server roles.

### 📝 Collaborative Word-Chain Story Game
A casual and chaotic text game.
* **Concept:** A channel where users collaboratively write a story.
* **Rules Enforced by Bot:**
  - Each message can only contain one word.
  - A user cannot send two messages consecutively.
  - The bot automatically deletes invalid messages and posts a humorous, soft error message.

### 📊 Premium Interactive Polls
Clean debates and decision-making.
* **Concept:** Command `/poll <question> [options separated by commas]`.
* **Visuals:** The bot creates a card showing the poll, with custom button options. As votes are cast, the bot dynamically updates the embed description to show a progress-bar visual of current percentages without printing new messages.

### 🎁 Kindness Roulette
Small daily challenges to build connection.
* **Concept:** A slash command `/kindness` that rolls a random wholesome task (e.g., *"Write a nice comment on a friend's latest post"*, *"Share a cute picture of your pet"*, or *"Drink a glass of water and stretch"*).
