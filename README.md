# bie-app

My personal project for my private discord application with my friends.

## self-hosting

1. make sure you have [Bun](https://bun.sh) installed.
2. clone the repo and run:
   ```bash
   bun install
   ```
3. copy `.env.example` to `.env.local` and set the variables:
   - `DISCORD_CLIENT_ID`: your discord client id.
   - `DISCORD_TOKEN`: your bot token.
   - `DISCORD_TARGET_SERVER`: your target guild id (for instant commands registry).
4. start it up:
   ```bash
   bun dev
   ```

### docker

for production (or pod) deployment, the bot compiles into a standalone binary inside a builder stage and runs in a minimal alpine container:

1. set your variables directly inside the `environment:` section of `docker-compose.yml`.
2. build and run using docker compose:
   ```bash
   docker compose up -d --build
   ```

## contributing

since this is just a private project with friends, just open a pr if you want to add something.
some guidelines:
- use functional patterns (functions/objects, no classes).
- write strict typescript.
- use `tsflag` from `ts-better-console` for console logs.
- test it locally first.
