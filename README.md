# Next.js Live Transcription

This starter serves the pinned `live-transcription-html` frontend as its user interface. Next.js hosts the REST API and the custom Node server adds only the WebSocket bridge required by live transcription; `DEEPGRAM_API_KEY` never reaches the browser.

## Architecture

- `frontend/` is the shared Vite frontend, served at `http://localhost:8080` in development.
- Next.js serves `GET /api/session` and `GET /api/metadata` at `http://localhost:8081`.
- `server.js` hosts Next.js and `WS /api/live-transcription` on port 8081, using the `access_token.<jwt>` WebSocket subprotocol.
- In production, Caddy serves `frontend/dist` and proxies `/api/*`, including WebSocket upgrades, to port 8081.

## Local Development

```sh
git submodule update --init --recursive
corepack pnpm install --frozen-lockfile
cd frontend && corepack pnpm install --frozen-lockfile && cd ..
cp sample.env.local .env.local
# Set DEEPGRAM_API_KEY in .env.local
make start
```

Open http://localhost:8080. To build both production artifacts, run `make build`.

## Production

Build with `docker build -f deploy/Dockerfile -t nextjs-live-transcription .`. The container exposes Caddy on port 8080 and runs Next.js plus the WebSocket bridge internally on port 8081.

## License

MIT - See [LICENSE](./LICENSE).
