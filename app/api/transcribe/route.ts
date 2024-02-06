export async function POST(request: Request, response: Response) {
  try {
    const requestBody = await request.json();

    // console.log("Posting to runpod:", requestBody);

    const runpodResponse = await fetch(
      "https://api.runpod.ai/v2/0vlaxo2gomini4/runsync",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.RUNPOD_API_KEY}`,
        },
        body: JSON.stringify(requestBody),
      }
    );

    if (!runpodResponse.ok) {
      throw new Error(
        `RunPod API responded with status: ${runpodResponse.status}`
      );
    }

    console.log("Runpod response:", runpodResponse);

    const responseData = await runpodResponse.json();

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
