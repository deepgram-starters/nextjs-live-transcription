import { Message } from "ai";

import fs, { Stats } from "fs";
import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { ReadableOptions } from "stream";

/**
 * Return a stream from the disk
 * @param {string} path - The location of the file
 * @param {ReadableOptions} options - The streamable options for the stream (ie how big are the chunks, start, end, etc).
 * @returns {ReadableStream} A readable stream of the file
 */
function streamFile(
  path: string,
  options?: ReadableOptions
): ReadableStream<Uint8Array> {
  const downloadStream = fs.createReadStream(path, options);

  return new ReadableStream({
    start(controller) {
      downloadStream.on("data", (chunk: Buffer) =>
        controller.enqueue(new Uint8Array(chunk))
      );
      downloadStream.on("end", () => controller.close());
      downloadStream.on("error", (error: NodeJS.ErrnoException) =>
        controller.error(error)
      );
    },
    cancel() {
      downloadStream.destroy();
    },
  });
}

/**
 * Return a NextRequest with the downloaded file
 * @param {NextRequest} req - The HTTP request
 * @returns {Promise<NextResponse>} A NextResponse with the downloadable file
 */
// export async function GET(req: NextRequest): Promise<NextResponse> {
//   // const uri = req.nextUrl.searchParams.get("uri");
//   const file = path.join(__dirname, "alpha-athena-en_hello-my-name-is.mp3");

//   const stats: Stats = await fs.promises.stat(file);
//   const data: ReadableStream<Uint8Array> = streamFile(file);
//   const res = new NextResponse(data, {
//     status: 200,
//     headers: new Headers({
//       //Headers
//       "content-disposition": `attachment; filename=${path.basename(file)}`,
//       "content-type": "audio/mp3",
//       "content-length": stats.size + "",
//     }),
//   });

//   return res;
// }

/**
 * Return a stream from the API
 * @param {NextRequest} req - The HTTP request
 * @returns {Promise<NextResponse>} A NextResponse with the streamable response
 */
export async function POST(req: NextRequest) {
  // gotta use the request object to invalidate the cache every request :vomit:
  const url = req.url;
  const message: Message = await req.json();

  console.log(message);

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
