export async function POST(request: Request, response: Response) {
  try {
    const requestBody = await request.json();
    console.log("POST request received", requestBody);

    const runpodResponse = await fetch(process.env.RUNPOD_RUNSYNC_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.RUNPOD_API_KEY}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!runpodResponse.ok) {
      throw new Error(
        `RunPod API responded with status: ${runpodResponse.status}`
      );
    }

    const responseData = await runpodResponse.json();
    console.log("RunPod response data:", responseData);

    // Correctly return JSON response to the client
    return new Response(JSON.stringify(responseData), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      }, // Serialize responseData to JSON string
    });
  } catch (error) {
    console.error("Failed to fetch transcript:", error);
    return new Response(
      JSON.stringify({ message: "Failed to fetch transcript" }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}
