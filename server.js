const { createHmac, randomBytes, timingSafeEqual } = require("node:crypto");
const { createServer } = require("node:http");
const next = require("next");
const { DeepgramClient } = require("@deepgram/sdk");
const { WebSocket, WebSocketServer } = require("ws");

const port = Number(process.env.PORT || 8081);
const host = process.env.HOST || "0.0.0.0";

function validProtocol(header) {
  const protocol = header
    ?.split(",")
    .map((value) => value.trim())
    .find((value) => value.startsWith("access_token."));
  if (!protocol) return null;

  const token = protocol.slice("access_token.".length);
  const [encodedHeader, payload, signature, extra] = token.split(".");
  if (!encodedHeader || !payload || !signature || extra) return null;

  const expected = createHmac("sha256", process.env.SESSION_SECRET)
    .update(`${encodedHeader}.${payload}`)
    .digest("base64url");
  if (signature.length !== expected.length || !timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
    return null;
  }

  try {
    const { exp } = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    return typeof exp === "number" && exp > Math.floor(Date.now() / 1000) ? protocol : null;
  } catch {
    return null;
  }
}

function deepgramClient() {
  const apiKey = process.env.DEEPGRAM_API_KEY;
  if (!apiKey) return null;
  const baseUrl = process.env.DEEPGRAM_BASE_URL;
  return new DeepgramClient({
    apiKey,
    ...(baseUrl && {
      environment: {
        base: baseUrl.replace(/^wss:/, "https:").replace(/^ws:/, "http:"),
        production: baseUrl,
        agent: baseUrl,
      },
    }),
  });
}

const app = next({ dev: process.env.NODE_ENV !== "production", hostname: host, port });
const handle = app.getRequestHandler();
const activeConnections = new Set();
const wss = new WebSocketServer({
  noServer: true,
  handleProtocols(protocols) {
    return [...protocols].find((protocol) => protocol.startsWith("access_token.")) || false;
  },
});

function closeWithProviderError(client) {
  if (client.readyState !== WebSocket.OPEN) return;
  client.send(
    JSON.stringify({
      type: "Error",
      description: "Unable to connect to transcription service. Check your API key and try again.",
    }),
    () => client.close(1011, "Transcription service connection failed")
  );
}

wss.on("connection", async (client, request) => {
  activeConnections.add(client);
  const deepgram = deepgramClient();
  if (!deepgram) {
    closeWithProviderError(client);
    activeConnections.delete(client);
    return;
  }

  const url = new URL(request.url, `http://${request.headers.host}`);
  const options = {
    model: url.searchParams.get("model") || "nova-3",
    language: url.searchParams.get("language") || "en",
    smart_format: url.searchParams.get("smart_format") || "true",
    interim_results: url.searchParams.get("interim_results") || "true",
    encoding: url.searchParams.get("encoding") || "linear16",
    sample_rate: url.searchParams.get("sample_rate") || "16000",
    channels: url.searchParams.get("channels") || "1",
  };
  const pending = [];
  let ready = false;
  let opened = false;
  let failed = false;
  let connection;

  function fail() {
    if (failed) return;
    failed = true;
    closeWithProviderError(client);
  }

  function forwardControl(message) {
    try {
      if (message.type === "KeepAlive") connection.sendKeepAlive({ type: "KeepAlive" });
      if (message.type === "Finalize") connection.sendFinalize({ type: "Finalize" });
      if (message.type === "CloseStream") connection.sendCloseStream({ type: "CloseStream" });
    } catch {
      fail();
    }
  }

  try {
    connection = await deepgram.listen.v1.createConnection(options);
  } catch {
    fail();
    activeConnections.delete(client);
    return;
  }

  connection.on("message", (message) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(typeof message === "string" ? message : JSON.stringify(message));
    }
  });
  connection.on("open", () => {
    opened = true;
  });
  connection.on("error", fail);
  connection.on("close", () => {
    if (client.readyState !== WebSocket.OPEN) return;
    if (!opened) fail();
    else client.close(1000, "Deepgram connection closed");
  });

  client.on("message", (data, isBinary) => {
    if (!ready) {
      pending.push({ data, isBinary });
      return;
    }
    if (isBinary) {
      try {
        connection.sendMedia(data);
      } catch {
        fail();
      }
      return;
    }
    try {
      forwardControl(JSON.parse(data.toString()));
    } catch {
      // Ignore malformed browser control messages to preserve the HTML frontend contract.
    }
  });
  client.on("close", () => {
    activeConnections.delete(client);
    try {
      connection.close();
    } catch {
      // The upstream connection may already be closed.
    }
  });
  client.on("error", () => {
    try {
      connection.close();
    } catch {
      // The upstream connection may already be closed.
    }
  });

  try {
    connection.connect();
    await connection.waitForOpen();
    ready = true;
    for (const message of pending) {
      if (message.isBinary) connection.sendMedia(message.data);
      else forwardControl(JSON.parse(message.data.toString()));
    }
    pending.length = 0;
  } catch {
    fail();
  }
});

app.prepare().then(() => {
  // Next loads .env.local during prepare; only create a process-local fallback afterwards.
  process.env.SESSION_SECRET ||= randomBytes(32).toString("hex");
  const server = createServer((request, response) => handle(request, response));
  server.on("upgrade", (request, socket, head) => {
    const pathname = new URL(request.url, "http://localhost").pathname;
    if (pathname !== "/api/live-transcription") {
      socket.destroy();
      return;
    }
    if (!validProtocol(request.headers["sec-websocket-protocol"])) {
      socket.end("HTTP/1.1 401 Unauthorized\r\n\r\n");
      return;
    }
    wss.handleUpgrade(request, socket, head, (client) => wss.emit("connection", client, request));
  });

  let stopping = false;
  const shutdown = () => {
    if (stopping) return;
    stopping = true;
    wss.close();
    for (const client of activeConnections) client.close(1001, "Server shutting down");
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(1), 10_000).unref();
  };
  process.once("SIGINT", shutdown);
  process.once("SIGTERM", shutdown);
  server.listen(port, host, () => console.log(`Next API and WebSocket server listening on http://${host}:${port}`));
});
