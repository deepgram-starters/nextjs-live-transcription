import { v } from "convex/values";
import {
  query,
  action,
  internalMutation,
  mutation,
  internalAction,
  internalQuery,
} from "./_generated/server";
import { api, internal } from "./_generated/api";
import { Doc, Id } from "./_generated/dataModel";

interface EmbeddingDetail {
  meetingID: string;
  finalizedSentenceId: string;
}

export const storeFinalizedSentence = mutation({
  args: {
    meetingID: v.id("meetings"),
    speaker: v.number(),
    transcript: v.string(),
    start: v.float64(),
    end: v.float64(),
  },
  async handler(
    { db, auth, scheduler },
    { meetingID, speaker, transcript, start, end }
  ) {
    const user = await auth.getUserIdentity();
    if (!user) {
      throw new Error("User not authenticated");
    }
    const finalizedSentenceId = await db.insert("finalizedSentences", {
      meetingID,
      userId: user.subject,
      speaker,
      transcript,
      start,
      end,
    });
    // Schedule the action to generate and add embedding
    return finalizedSentenceId;
  },
});

export const generateAndSaveEmbedding = action({
  args: {
    finalizedSentenceId: v.id("finalizedSentences"),
    transcript: v.string(),
    meetingID: v.id("meetings"),
  },
  handler: async (ctx, args) => {
    // Generate embedding
    const embedding = await generateTextEmbedding(args.transcript);
    // Store the embedding
    const embeddingId = await ctx.runMutation(
      internal.transcript.addEmbedding,
      {
        finalizedSentenceId: args.finalizedSentenceId,
        embedding: embedding,
        meetingID: args.meetingID,
      }
    );

    // Update the sentence with the embedding ID
    if (embeddingId === null) {
      // Handle the null case: log, throw an error, or take other appropriate action
      console.error("Failed to generate or save embedding.");
      throw new Error("Failed to generate or save embedding.");
    } else {
      // Proceed with using the embeddingId, now guaranteed to be non-null
      await ctx.runMutation(api.transcript.updateSentenceWithEmbedding, {
        finalizedSentenceId: args.finalizedSentenceId,
        embeddingId: embeddingId, // This is now guaranteed to be non-null
      });
    }

    return embedding;
  },
});

export const generateTextEmbedding = async (
  text: string
): Promise<number[]> => {
  const key = process.env.RUNPOD_API_KEY;
  if (!key) {
    throw new Error("RUNPOD_API_KEY environment variable not set!");
  }
  const requestBody = {
    input: {
      sentence: text,
    },
  };

  const response = await fetch(`${process.env.RUNPOD_RUNSYNC_URL}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const msg = await response.text();
    throw new Error(`RunPod API error: ${msg}`);
  }

  const data = await response.json();
  // Adjusted to correctly access the embeddings array within the output object
  const embedding = data.output.embeddings;
  if (!Array.isArray(embedding) || embedding.some(isNaN)) {
    console.error("Invalid embedding format:", embedding);
    throw new Error(
      "Failed to generate a valid text embedding due to invalid format."
    );
  }

  // console.log(
  //   `Computed embedding of "${text}": ${embedding.length} dimensions`
  // );
  return embedding;
};

export const addEmbedding = internalMutation({
  args: {
    finalizedSentenceId: v.id("finalizedSentences"),
    embedding: v.array(v.float64()),
    meetingID: v.id("meetings"),
  },
  handler: async ({ db }, { finalizedSentenceId, embedding, meetingID }) => {
    const embeddingId = await db.insert("sentenceEmbeddings", {
      meetingID, // This needs to be included
      finalizedSentenceId,
      embedding,
    });
    return embeddingId;
  },
});

export const updateSentenceWithEmbedding = mutation({
  args: {
    finalizedSentenceId: v.id("finalizedSentences"),
    embeddingId: v.id("sentenceEmbeddings"), // This matches the corrected field name
  },
  handler: async ({ db }, { finalizedSentenceId, embeddingId }) => {
    await db.patch(finalizedSentenceId, {
      sentenceEmbeddingId: embeddingId, // Ensure this matches the field in your schema
    });
  },
});

//@ts-ignore
export const searchSentencesByEmbedding = action({
  args: {
    searchQuery: v.string(),
  },
  handler: async (ctx, args) => {
    // Generate an embedding from the search query
    const embedding = await generateTextEmbedding(args.searchQuery);

    // Perform a vector search with the generated embedding
    const results = await ctx.vectorSearch(
      "sentenceEmbeddings",
      "embeddingVector",
      {
        vector: embedding,
        limit: 10,
      }
    );

    // Fetch additional details for each result using the internal query
    const resultsWithDetails: (EmbeddingDetail & { score: number })[] =
      await Promise.all(
        results.map(async (result) => {
          const details = await ctx.runQuery(
            internal.transcript.fetchEmbeddingDetails,
            {
              embeddingId: result._id,
            }
          );
          // Merge the score from the search result with the fetched details
          return { ...details, score: result._score };
        })
      );
    return resultsWithDetails;
  },
});

export const fetchEmbeddingDetails = internalQuery({
  args: { embeddingId: v.id("sentenceEmbeddings") },
  handler: async (ctx, { embeddingId }) => {
    const embeddingDetails = await ctx.db.get(embeddingId);
    if (!embeddingDetails) {
      throw new Error("Embedding details not found");
    }
    return {
      meetingID: embeddingDetails.meetingID,
      finalizedSentenceId: embeddingDetails.finalizedSentenceId,
    };
  },
});

export const fetchFinalizedSentences = internalQuery({
  args: { ids: v.array(v.id("finalizedSentences")) },
  handler: async (ctx, args) => {
    const results = [];
    for (const id of args.ids) {
      const doc = await ctx.db.get(id);
      if (doc === null) {
        continue;
      }
      results.push(doc);
    }
    return results;
  },
});

export const fetchMultipleFinalizedSentenceDetails = query({
  args: { sentenceIds: v.array(v.id("finalizedSentences")) },
  handler: async (ctx, { sentenceIds }) => {
    const user = await ctx.auth.getUserIdentity();

    if (!user) {
      throw new Error(
        "Please login to retrieve finalized sentences for a meeting"
      );
    }

    const sentences = await Promise.all(
      sentenceIds.map(async (id) => await ctx.db.get(id))
    );

    // console.log("Fetched sentences:", sentences);

    return sentences.filter((sentence) => sentence !== null);
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

export const deleteFinalizedSentence = mutation({
  args: {
    sentenceId: v.id("finalizedSentences"), // Assuming "finalizedSentences" is the collection name
  },
  async handler({ db, auth }, { sentenceId }) {
    const user = await auth.getUserIdentity();
    if (!user) {
      throw new Error("User not authenticated");
    }
    await db.delete(sentenceId); // Delete the sentence by its ID
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
      const runpodResponse = await postAudioToRunpod(audioUrl);

      // console.log("Runpod response data:", runpodResponse);
    } catch (error) {
      console.error("Failed to fetch transcript:", error);
    }
  },
});

async function postAudioToRunpod(audioUrl: string): Promise<any> {
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
