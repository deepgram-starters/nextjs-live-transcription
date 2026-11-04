#!/bin/sh
set -e

corepack pnpm run start &
exec caddy run --config /etc/caddy/Caddyfile --adapter caddyfile
