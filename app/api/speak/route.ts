import { Message } from "ai";

export async function POST(request: Request) {
  // gotta use the request object to invalidate the cache every request :vomit:
  const url = request.url;
  const message: Message = await request.json();

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
    .then(async (response) => {
      if (!response?.body) {
        return new Response("Unable to get response from API.", {
          status: 500,
        });
      }

      return new Response(response.body);
    })
    .catch((error: any) => {
      return new Response(error || error?.message, { status: 500 });
    });
}
