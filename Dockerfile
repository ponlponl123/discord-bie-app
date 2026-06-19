# Stage 1: Compile and compress stand-alone executable binary
FROM oven/bun:1-alpine AS builder

WORKDIR /app

# Install UPX for binary compression
RUN apk add --no-cache upx

# Copy configuration and lockfile
COPY package.json bun.lock ./

# Install dependencies (required for build compilation)
RUN bun install

# Copy source files
COPY src ./src
COPY tsconfig.json ./

# Compile bot into a single standalone binary with minification
RUN bun build src/index.ts --compile --minify --outfile discord-wumpus-app

# Compress the compiled binary using UPX (reduces binary size by ~70%)
RUN upx --best --lzma discord-wumpus-app

# Stage 2: Final minimal runner image
FROM alpine:latest

WORKDIR /app

# Install dynamic link dependencies and SSL certificates
RUN apk add --no-cache ca-certificates libstdc++

# Copy only the compressed standalone binary from builder
COPY --from=builder /app/discord-wumpus-app ./discord-wumpus-app

# Run as non-root user for container security
RUN addgroup -S botgroup && adduser -S botuser -G botgroup
USER botuser

# Run the compiled binary
ENTRYPOINT ["./discord-wumpus-app"]
