# Stage 1: Compile stand-alone executable binary
FROM oven/bun:1-alpine AS builder

WORKDIR /app

# Copy configuration and lockfile
COPY package.json bun.lock ./

# Install dependencies (required for build compilation)
RUN bun install

# Copy source files
COPY src ./src
COPY tsconfig.json ./

# Compile bot into a single standalone binary
RUN bun build src/index.ts --compile --outfile discord-bie-app

# Stage 2: Final minimal runner image
FROM alpine:latest

WORKDIR /app

# Install dynamic link dependencies and SSL certificates
RUN apk add --no-cache ca-certificates libstdc++

# Copy only the compiled standalone binary from builder
COPY --from=builder /app/discord-bie-app ./discord-bie-app

# Run as non-root user for container security
RUN addgroup -S botgroup && adduser -S botuser -G botgroup
USER botuser

# Run the compiled binary
ENTRYPOINT ["./discord-bie-app"]
