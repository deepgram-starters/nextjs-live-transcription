import { Message } from "ai";
import { NextRequest, NextResponse } from "next/server";

/**
 * Return a stream from the API
 * @param {NextRequest} req - The HTTP request
 * @returns {Promise<NextResponse>} A NextResponse with the streamable response
 */
export async function POST(req: NextRequest) {
  // gotta use the request object to invalidate the cache every request :vomit:
  const url = req.url;
  const message: Message = await req.json();
  const start = Date.now();

  return await fetch(
    `${process.env.DEEPGRAM_STT_DOMAIN}/v1/speak?model=aura-athena-en`,
    {
      method: "POST",
      body: JSON.stringify({ text: message.content }),
      headers: {
        "Content-Type": `application/json`,
        Authorization: `token ${process.env.DEEPGRAM_API_KEY || ""}`,
        "X-DG-Referrer": url,
      },
    }
  )
    .then(async (response) => {
      const headers = new Headers();
      headers.set("X-DG-Latency", `${Date.now() - start}`);

      if (!response?.body) {
        return new NextResponse("Unable to get response from API.", {
          status: 500,
        });
      }

      return new NextResponse(response.body, { headers });
    })
    .catch((error: any) => {
      return new NextResponse(error || error?.message, { status: 500 });
    });
}
