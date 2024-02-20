import { DeepgramError, createClient } from "@deepgram/sdk";
import { Message } from "ai";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  // gotta use the request object to invalidate the cache every request :vomit:
  const url = request.url;
  const message: Message = await request.json();

  // const deepgram = createClient(process.env.DEEPGRAM_API_KEY ?? "", {
  //   global: { url: process.env.DEEPGRAM_STT_DOMAIN },
  // });

  return await fetch(
    `${process.env.DEEPGRAM_STT_DOMAIN}/v1/speak?model=alpha-asteria-en`,
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
    .then((res) => {
      return res.blob();
    })
    .then((data) => {
      return new Response(data, { headers: { "content-type": "audio/mp3" } });
    })
    .catch((error: any) => {
      return new Response(error || error?.message, { status: 500 });
    });
}
