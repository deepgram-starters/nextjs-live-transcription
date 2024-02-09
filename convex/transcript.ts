import { v } from "convex/values";
import { action, mutation, query } from "./_generated/server";
import { api } from "./_generated/api";

export const storeFinalizedSentence = mutation({
  args: {
    meetingID: v.id("meetings"),
    speaker: v.number(),
    transcript: v.string(),
    start: v.float64(),
    end: v.float64(),
  },
  async handler({ db }, { meetingID, speaker, transcript, start, end }) {
    await db.insert("finalizedSentences", {
      meetingID,
      speaker,
      transcript,
      start,
      end,
    });
  },
});

export const getFinalizedSentencesByMeeting = query({
  args: { meetingID: v.id("meetings") },
  async handler({ db }, { meetingID }) {
    return await db
      .query("finalizedSentences")
      .filter((q) => q.eq(q.field("meetingID"), meetingID))
      .collect();
  },
});

export const storeQuestion = mutation({
  args: {
    meetingID: v.id("meetings"),
    question: v.string(),
    timestamp: v.float64(),
    speaker: v.number(),
  },
  async handler({ db }, { meetingID, question, timestamp, speaker }) {
    await db.insert("questions", {
      meetingID,
      question,
      timestamp,
      speaker,
    });
  },
});

export const storeWordDetail = mutation({
  args: {
    meetingID: v.id("meetings"),
    word: v.string(),
    start: v.float64(),
    end: v.float64(),
    confidence: v.float64(),
    speaker: v.number(),
    punctuated_word: v.string(),
    audio_embedding: v.optional(v.array(v.float64())),
  },
  async handler(
    { db },
    {
      meetingID,
      word,
      start,
      end,
      confidence,
      speaker,
      punctuated_word,
      audio_embedding,
    }
  ) {
    await db.insert("wordDetails", {
      meetingID,
      word,
      start,
      end,
      confidence,
      speaker,
      punctuated_word,
      audio_embedding, // This can be null initially if you plan to update it later
    });
  },
});

export const generateAudioUploadUrl = mutation(async (ctx) => {
  return await ctx.storage.generateUploadUrl();
});

export const sendAudio = mutation({
  args: {
    storageId: v.id("_storage"), // The ID of the uploaded file in Convex storage
    meetingID: v.id("meetings"), // Assuming you want to associate the audio with a meeting
  },
  handler: async (ctx, args) => {
    const url = await ctx.db.insert("audioFiles", {
      storageId: args.storageId,
      meetingID: args.meetingID,
      // Include any other fields you added to the args
    });

    console.log("audio saved", url);
  },
});

export const generateAudioFileUrl = query({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, { storageId }) => {
    return await ctx.storage.getUrl(storageId);
  },
});

export const processAudioEmbedding = action({
  args: {
    storageId: v.id("_storage"), // The ID of the uploaded file in Convex storage
  },
  handler: async (ctx, { storageId }) => {
    try {
      const audioUrl = await getAudioUrl(ctx, storageId);
      const runpodResponse = await postToRunpod(audioUrl);

      console.log("Runpod response data:", runpodResponse);

      // Process the response as needed
    } catch (error) {
      console.error("Failed to fetch transcript:", error);
      // Handle the error appropriately
    }
  },
});

async function getAudioUrl(ctx: any, storageId: string): Promise<string> {
  return await ctx.storage.getUrl(storageId);
}

async function postToRunpod(audioUrl: string): Promise<any> {
  const requestBody = {
    input: {
      audio_file: audioUrl,
    },
  };

  console.log("Posting to runpod:", requestBody);

  const response = await fetch(`${process.env.RUNPOD_RUNSYNC_URL}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.RUNPOD_API_KEY}`,
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    throw new Error(`RunPod API responded with status: ${response.status}`);
  }

  return await response.json();
}
