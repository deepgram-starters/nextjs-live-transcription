import { createHmac, randomBytes } from "node:crypto";
import { NextResponse } from "next/server";

const fallbackSecret = randomBytes(32).toString("hex");

export const runtime = "nodejs";

export function GET() {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const payload = Buffer.from(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 3600 })).toString("base64url");
  const secret = process.env.SESSION_SECRET || process.env.DEEPGRAM_API_KEY || fallbackSecret;
  const signature = createHmac("sha256", secret).update(`${header}.${payload}`).digest("base64url");

  return NextResponse.json({ token: `${header}.${payload}.${signature}` });
}
