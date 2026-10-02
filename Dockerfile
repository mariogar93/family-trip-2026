# ==========================================
# Stage 1: Build Frontend SPA
# ==========================================
FROM node:20-bookworm-slim AS builder

WORKDIR /app

# Install all dependencies (including devDependencies for Vite & Tailwind)
COPY package*.json ./
RUN npm ci

# Copy source code and build production bundle (dist)
COPY . .
RUN npm run build

# ==========================================
# Stage 2: Production Runner
# ==========================================
FROM node:20-bookworm-slim

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3001
ENV DATA_DIR=/app/data

# Install build tools required for better-sqlite3 native compilation
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Install production dependencies only
COPY package*.json ./
RUN npm ci --omit=dev

# Copy server backend and public assets
COPY server/ ./server/
COPY public/ ./public/

# Copy built frontend assets from builder stage
COPY --from=builder /app/dist ./dist

# Ensure persistent data & uploads directory exists
RUN mkdir -p /app/data/uploads

EXPOSE 3001

VOLUME ["/app/data"]

CMD ["node", "server/index.js"]
