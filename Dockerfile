# JAT — Jomarchy Agent Tools
# Multi-stage Docker build for JAT IDE server
#
# Build:  docker build -t jat .
# Run:    docker compose up -d

# ─── Stage 1: Build the IDE ───────────────────────────────────────────────────
FROM node:22-bookworm-slim AS builder

WORKDIR /build

# Copy package files first for better layer caching
COPY package.json package-lock.json ./
COPY ide/package.json ide/package-lock.json* ide/

# Install all dependencies (including devDependencies for build)
RUN cd /build && npm ci --ignore-scripts && \
    cd /build/ide && npm ci --legacy-peer-deps

# Copy source code
COPY . .

# Rebuild native modules (better-sqlite3) for the container arch
RUN cd /build && npm rebuild better-sqlite3 && \
    cd /build/ide && npm rebuild better-sqlite3

# Build the SvelteKit app
RUN cd /build/ide && npm run build

# ─── Stage 2: Runtime ─────────────────────────────────────────────────────────
FROM node:22-bookworm-slim AS runtime

# System dependencies JAT needs at runtime
RUN apt-get update && apt-get install -y --no-install-recommends \
    tmux \
    sqlite3 \
    jq \
    git \
    curl \
    bash \
    procps \
    && rm -rf /var/lib/apt/lists/*

# Create non-root user
RUN useradd -m -s /bin/bash jat

# Set up directory structure
RUN mkdir -p /home/jat/.local/bin \
    /home/jat/.config/jat \
    /home/jat/data/jat \
    /home/jat/projects \
    && chown -R jat:jat /home/jat

USER jat
WORKDIR /home/jat

# Copy JAT source (tools, CLI, libs, scripts)
COPY --chown=jat:jat tools/ /home/jat/jat/tools/
COPY --chown=jat:jat cli/ /home/jat/jat/cli/
COPY --chown=jat:jat lib/ /home/jat/jat/lib/
COPY --chown=jat:jat commands/ /home/jat/jat/commands/
COPY --chown=jat:jat skills/ /home/jat/jat/skills/
COPY --chown=jat:jat shared/ /home/jat/jat/shared/
COPY --chown=jat:jat install.sh /home/jat/jat/install.sh
COPY --chown=jat:jat package.json /home/jat/jat/package.json
COPY --chown=jat:jat CLAUDE.md AGENTS.md /home/jat/jat/

# Copy root node_modules (better-sqlite3 for lib/tasks.js)
COPY --from=builder --chown=jat:jat /build/node_modules/ /home/jat/jat/node_modules/

# Copy built IDE + production dependencies
COPY --from=builder --chown=jat:jat /build/ide/build/ /home/jat/jat/ide/build/
COPY --from=builder --chown=jat:jat /build/ide/package.json /home/jat/jat/ide/package.json
COPY --from=builder --chown=jat:jat /build/ide/node_modules/ /home/jat/jat/ide/node_modules/

# Copy IDE config files needed at runtime
COPY --chown=jat:jat ide/svelte.config.js /home/jat/jat/ide/
COPY --chown=jat:jat ide/vite.config.ts /home/jat/jat/ide/

# Copy browser tools dependencies
COPY --chown=jat:jat tools/browser/package.json /home/jat/jat/tools/browser/

# Symlink all JAT tools to ~/.local/bin
RUN bash /home/jat/jat/tools/scripts/symlink-tools.sh

# Ensure ~/.local/bin is in PATH
ENV PATH="/home/jat/.local/bin:${PATH}"
ENV JAT_INSTALL_DIR="/home/jat/jat"
ENV NODE_ENV="production"

# IDE server port
EXPOSE 3333

# Health check - the IDE server responds on /api/health or just /
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -sf http://localhost:3333/ || exit 1

# Start the IDE server
CMD ["node", "/home/jat/jat/ide/build/index.js"]
