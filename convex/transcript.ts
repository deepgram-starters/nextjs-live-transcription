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
  async handler({ db, auth }, { meetingID, speaker, transcript, start, end }) {
    const user = await auth.getUserIdentity();
    if (!user) {
      throw new Error("User not authenticated");
    }
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
  handler: async (ctx, args) => {
    const user = await ctx.auth.getUserIdentity();

    if (!user) {
      throw new Error(
        "Please login to retrieve finalized sentences for a meeting"
      );
    }

    return await ctx.db
      .query("finalizedSentences")
      .filter((q) => q.eq(q.field("meetingID"), args.meetingID))
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
  async handler({ db, auth }, { meetingID, question, timestamp, speaker }) {
    const user = await auth.getUserIdentity();
    if (!user) {
      throw new Error("User not authenticated");
    }
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
    { db, auth },
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
    const user = await auth.getUserIdentity();
    if (!user) {
      throw new Error("User not authenticated");
    }
    await db.insert("wordDetails", {
      meetingID,
      word,
      start,
      end,
      confidence,
      speaker,
      punctuated_word,
      audio_embedding,
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
  handler: async ({ db, auth }, args) => {
    const user = await auth.getUserIdentity();
    if (!user) {
      throw new Error("User not authenticated");
    }
    const url = await db.insert("audioFiles", {
      storageId: args.storageId,
      meetingID: args.meetingID,
    });
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
  handler: async ({ storage, auth }, { storageId }) => {
    const user = await auth.getUserIdentity();
    if (!user) {
      throw new Error("User not authenticated");
    }
    try {
      const audioUrl = (await storage.getUrl(storageId)) as string;
      const runpodResponse = await postToRunpod(audioUrl);
      console.log("Runpod response data:", runpodResponse);
    } catch (error) {
      console.error("Failed to fetch transcript:", error);
    }
  },
});

async function postToRunpod(audioUrl: string): Promise<any> {
  const requestBody = {
    input: {
      audio_file: audioUrl,
    },
  };

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
