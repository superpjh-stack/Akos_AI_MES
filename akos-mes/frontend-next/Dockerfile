# ============================================================
# Stage 1 — Dependencies
# ============================================================
FROM node:18-alpine AS deps

WORKDIR /app

# Copy package manifests only (better layer caching)
COPY package.json package-lock.json* ./

RUN npm ci --prefer-offline

# ============================================================
# Stage 2 — Build
# ============================================================
FROM node:18-alpine AS builder

WORKDIR /app

# Copy installed node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy full source
COPY . .

# Disable Next.js telemetry during build
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# ============================================================
# Stage 3 — Runner (production image)
# ============================================================
FROM node:18-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser  --system --uid 1001 nextjs

# Copy only the standalone output + static assets
COPY --from=builder /app/public           ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static     ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# next start is handled by the standalone server.js
CMD ["node", "server.js"]
