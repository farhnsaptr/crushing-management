# syntax=docker/dockerfile:1

##########################################################################
# Stage 1 — builder: install all deps, compile TS, prune to prod modules
##########################################################################
FROM node:22-alpine AS builder
WORKDIR /app

# Toolchain for native addons (bcrypt compiles from source; sharp pulls
# its musl prebuilt but keep these so a source fallback still works).
RUN apk add --no-cache python3 make g++

# Install dependencies first for better layer caching.
# npm ci installs devDependencies too (needed for tsc) because NODE_ENV
# is intentionally left unset in this stage.
COPY package.json package-lock.json ./
RUN npm ci

# Compile TypeScript -> dist/
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# Strip devDependencies; compiled native modules in prod deps are kept.
RUN npm prune --omit=dev

##########################################################################
# Stage 2 — runtime: minimal image with only prod node_modules + dist
##########################################################################
FROM node:22-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app

# dumb-init = correct PID 1: forwards signals and reaps zombies.
RUN apk add --no-cache dumb-init

# Runtime artifacts only. --chown so the non-root user owns them.
COPY --from=builder --chown=node:node /app/node_modules ./node_modules
COPY --from=builder --chown=node:node /app/dist ./dist
COPY --chown=node:node package.json ./

# App serves /uploads from process.cwd(); keep it writable by the app user.
# Mount a volume here in production to persist uploads.
RUN mkdir -p /app/uploads && chown node:node /app/uploads

USER node

# Documentation only — actual port comes from the PORT env var.
EXPOSE 4000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "const p=process.env.PORT||4000;require('http').get('http://127.0.0.1:'+p+'/health',r=>process.exit(r.statusCode===200?0:1)).on('error',()=>process.exit(1))"

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/server.js"]
