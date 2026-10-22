FROM golang:1.25-alpine AS caddy-builder
WORKDIR /build
RUN go install github.com/caddyserver/xcaddy/cmd/xcaddy@latest && xcaddy build --with github.com/mholt/caddy-ratelimit

FROM node:24-slim AS frontend-builder
RUN corepack enable
WORKDIR /build
COPY frontend/package.json frontend/pnpm-lock.yaml ./frontend/
RUN cd frontend && pnpm install --frozen-lockfile
COPY frontend/ ./frontend/
RUN cd frontend && pnpm run build
RUN sed -i 's|<head>|<head>\n  <base href="{{ .Req.Header.Get "X-Base-Path" }}">|' ./frontend/dist/index.html

FROM node:24-slim AS backend-builder
RUN corepack enable
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY app ./app
COPY public ./public
COPY server.js next.config.js postcss.config.js tailwind.config.ts tsconfig.json next-env.d.ts ./
RUN pnpm run build

FROM node:24-slim
RUN corepack enable
WORKDIR /app
COPY --from=caddy-builder /build/caddy /usr/bin/caddy
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod
COPY --from=backend-builder /app/.next ./.next
COPY --from=backend-builder /app/public ./public
COPY --from=backend-builder /app/server.js ./server.js
COPY --from=backend-builder /app/next.config.js ./next.config.js
COPY --from=frontend-builder /build/frontend/dist ./frontend/dist
COPY deploy/Caddyfile /etc/caddy/Caddyfile
COPY deploy/start.sh ./start.sh
RUN chmod +x ./start.sh
ENV PORT=8081
ENV HOST=0.0.0.0
EXPOSE 8080
CMD ["./start.sh"]
