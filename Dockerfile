# JAT (Jomarchy Agent Tools) - Docker Build
# Multi-stage build for minimal production image

# ── Stage 1: Build ───────────────────────────────────────────────────────────
FROM node:22-slim AS builder

WORKDIR /app

# Install build tools for native modules (better-sqlite3)
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Install root dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Install IDE dependencies
COPY ide/package.json ide/package-lock.json ./ide/
RUN cd ide && npm ci --legacy-peer-deps

# Copy source
COPY . .

# Build IDE for production (adapter-node output)
RUN cd ide && npm run build

# ── Stage 2: Runtime ─────────────────────────────────────────────────────────
FROM node:22-slim

# Runtime deps: tmux for agent sessions, sqlite3 for CLI, jq for JSON, git
RUN apt-get update && apt-get install -y --no-install-recommends \
    tmux \
    sqlite3 \
    jq \
    git \
    bash \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy root package + deps (for lib/tasks.js and shared modules)
COPY --from=builder /app/package.json /app/package-lock.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/lib ./lib
COPY --from=builder /app/shared ./shared

# Copy built IDE
COPY --from=builder /app/ide/build ./ide/build
COPY --from=builder /app/ide/package.json ./ide/package.json
COPY --from=builder /app/ide/node_modules ./ide/node_modules

# Copy CLI tools and scripts
COPY --from=builder /app/cli ./cli
COPY --from=builder /app/tools ./tools
COPY --from=builder /app/skills ./skills
COPY --from=builder /app/templates ./templates
COPY --from=builder /app/commands ./commands

# Symlink tools into PATH
RUN mkdir -p /usr/local/bin && \
    bash tools/scripts/symlink-tools.sh 2>/dev/null || true

# Create directories for mounted volumes
RUN mkdir -p /root/.config/jat /root/.claude/sessions /tmp

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3333

EXPOSE 3333

# Start the built SvelteKit server
CMD ["node", "ide/build/index.js"]
