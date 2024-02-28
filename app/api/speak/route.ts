import { Message } from "ai";

import fs, { Stats } from "fs";
import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { ReadableOptions } from "stream";

/**
 * Return a stream from the API
 * @param {NextRequest} req - The HTTP request
 * @returns {Promise<NextResponse>} A NextResponse with the streamable response
 */
export async function GET(req: NextRequest) {
  const uri = req.nextUrl.searchParams.get("uri");

  return await fetch(`${req.nextUrl.origin}/${uri}`)
    .then(async (response) => {
      if (!response?.body) {
        return new NextResponse("Unable to get response from API.", {
          status: 500,
        });
      }

      return new NextResponse(response.body);
    })
    .catch((error: any) => {
      return new NextResponse(error || error?.message, { status: 500 });
    });
}

/**
 * Return a stream from the API
 * @param {NextRequest} req - The HTTP request
 * @returns {Promise<NextResponse>} A NextResponse with the streamable response
 */
export async function POST(req: NextRequest) {
  // gotta use the request object to invalidate the cache every request :vomit:
  const url = req.url;
  const message: Message = await req.json();

  return await fetch(
    `${process.env.DEEPGRAM_STT_DOMAIN}/v1/speak?model=alpha-athena-en`,
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
      if (!response?.body) {
        return new NextResponse("Unable to get response from API.", {
          status: 500,
        });
      }

      return new NextResponse(response.body);
    })
    .catch((error: any) => {
      return new NextResponse(error || error?.message, { status: 500 });
    });
}
