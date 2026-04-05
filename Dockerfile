# Dockerfile — Multi-stage build
# Stage 1: Build SvelteKit static site
# Stage 2: Run Hono API proxy + serve static files
#
# Usage: docker build -t navigator . && docker run -p 3001:3001 navigator

# --- Stage 1: Build frontend ---
FROM node:24-alpine AS build

WORKDIR /app/frontend
COPY app/package*.json ./
RUN npm ci
COPY app/ ./
RUN npm run build

# --- Stage 2: Production ---
FROM node:24-alpine

WORKDIR /app

# Install API dependencies
COPY api/package*.json ./
RUN npm ci --omit=dev

# Copy API source
COPY api/ ./

# Copy built frontend
COPY --from=build /app/frontend/build ./public

ENV PORT=3001
EXPOSE 3001

CMD ["node", "server.js"]
