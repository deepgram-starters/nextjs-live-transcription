import { DeepgramClient } from "@deepgram/sdk";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const apiKey = process.env.DEEPGRAM_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "DEEPGRAM_API_KEY is required" },
      { status: 500 }
    );
  }

  try {
    const deepgram = new DeepgramClient({ apiKey });
    const token = await deepgram.auth.v1.tokens.grant();
    const response = NextResponse.json(token);
    response.headers.set("Cache-Control", "no-store");
    return response;
  } catch {
    return NextResponse.json(
      { error: "Failed to generate a temporary Deepgram token" },
      { status: 502 }
    );
  }
}
