# syntax=docker/dockerfile:1

##########################################################################
# Stage 1 — builder: install deps and produce the static Vite bundle
##########################################################################
FROM node:22-alpine AS builder
WORKDIR /app

# Vite inlines VITE_* env at BUILD time. Pass it as a build arg:
#   docker build --build-arg VITE_API_BASE_URL=https://api.example.com ...
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

##########################################################################
# Stage 2 — runtime: minimal static server (SPA fallback via `serve -s`)
# Public routing/TLS handled by the external nginx (nginx-public network).
##########################################################################
FROM node:22-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app

# dumb-init = correct PID 1: forwards signals and reaps zombies.
RUN apk add --no-cache dumb-init \
    && npm i -g serve@14 \
    && npm cache clean --force

# Static bundle only — no source, no node_modules.
COPY --from=builder /app/dist ./dist

USER node
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3000/ >/dev/null 2>&1 || exit 1

# `-s` = single-page-app mode: unknown paths fall back to index.html.
ENTRYPOINT ["dumb-init", "--"]
CMD ["serve", "-s", "dist", "-l", "3000"]
