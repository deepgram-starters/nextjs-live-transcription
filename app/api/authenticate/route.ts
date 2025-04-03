import { NextResponse } from "next/server";

export async function GET(): Promise<NextResponse> {
  try {
    const deepgramApiKey = process.env.DEEPGRAM_API_KEY;
    if (!deepgramApiKey) {
      return NextResponse.json(
        { error: "Deepgram API key is missing." },
        { status: 500 }
      );
    }
    
    // Return the API key or generate a temporary access token if needed
    return NextResponse.json({ apiKey: deepgramApiKey });
  } catch (error) {
    console.error("Error fetching Deepgram API key:", error);
    return NextResponse.json({ error: "Failed to fetch API key" }, { status: 500 });
  }
}
