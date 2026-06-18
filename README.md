# bie-app

My personal project for my private discord application with my friends.

## self-hosting

1. make sure you have [Bun](https://bun.sh) installed.
2. clone the repo and run:
   ```bash
   bun install
   ```
3. Setup your database and cache. You will need:
   - A **MySQL / MariaDB** database.
   - A **Redis Sentinel** setup (if you run it locally in docker, Sentinel reports internal docker IPs which the app dynamically NAT-maps back to localhost for you).
4. Copy `.env.example` to `.env.local` and set the variables:
   - `DISCORD_CLIENT_ID`: your Discord client ID.
   - `DISCORD_TOKEN`: your Discord bot token.
   - `DISCORD_TARGET_SERVER`: your server's ID (for fast commands registry).
   - `DATABASE_URL`: connection string for Prisma (e.g. `mysql://user:password@localhost:3306/dbname`).
   - `REDIS_SENTINEL_HOSTS`: comma-separated sentinel hosts (e.g. `127.0.0.1:26379,127.0.0.1:26380`).
   - `REDIS_SENTINEL_NAME`: name of the master group (usually `mymaster`).
   - `REDIS_PASSWORD`: (optional) password for the Redis master/replica nodes.
   - `REDIS_SENTINEL_PASSWORD`: (optional) password for the Redis Sentinel nodes.
   - `NODE_ENV`: set to `development` for local testing.
5. Generate the Prisma database client:
   ```bash
   npx prisma generate
   ```
6. Start it up:
   ```bash
   bun dev
   ```

### docker

for production (or pod) deployment, the bot compiles into a standalone binary inside a builder stage and runs in a minimal alpine container:

1. copy `docker-compose.yml` to `docker-compose.yml.local` (which is ignored by git).
2. set your environment variables directly in `docker-compose.yml.local`.
3. build and run using:
   ```bash
   docker compose -f docker-compose.yml.local up -d --build
   ```

## contributing

since this is just a private project with friends, just open a pr if you want to add something.
some guidelines:
- use functional patterns (functions/objects, no classes).
- write strict typescript.
- use `tsflag` from `ts-better-console` for console logs.
- test it locally first.
