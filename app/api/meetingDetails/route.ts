import { NextResponse } from "next/server";
import { api } from "@/convex/_generated/api";
import { fetchQuery } from "convex/nextjs";
import type { Doc, Id } from "@/convex/_generated/dataModel";
// Import Clerk's backend SDK
import { auth } from "@clerk/nextjs";

async function getAuthToken() {
  return (await auth().getToken({ template: "convex" })) ?? undefined;
}

export async function GET(request: Request) {
  // Authenticate the request using Clerk
  const token = await getAuthToken();

  // Assuming you're passing the meetingID as a query parameter
  const url = new URL(request.url);
  const meetingID = url.searchParams.get("meetingID");

  if (!meetingID) {
    return new Response(JSON.stringify({ error: "Meeting ID is required" }), {
      status: 400,
    });
  }

  // Fetch finalized sentences for the meeting
  const finalizedSentences = await fetchQuery(
    api.transcript.getFinalizedSentencesByMeeting,
    { meetingID: meetingID as Id<"meetings"> },
    // Now that we have authenticated, we can pass the userId if needed
    { token }
  );

  // Respond with the fetched data
  return NextResponse.json(finalizedSentences);
}
