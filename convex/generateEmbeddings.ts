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

type FinalizedSentence = {
  _id: Id<"finalizedSentences">;
  _creationTime: number;
  userId?: string | undefined;
  sentenceEmbeddingId?: Id<"sentenceEmbeddings"> | undefined;
  end: number;
  meetingID: Id<"meetings">;
  speaker: number;
  start: number;
  transcript: string;
};

export const backfillUserIdInFinalizedSentences = internalMutation({
  args: {},
  handler: async (ctx) => {
    // Fetch all finalizedSentences documents
    const sentences = await ctx.db.query("finalizedSentences").collect();

    for (const sentence of sentences) {
      // Assuming you can get the userId from the meetingID
      const meeting = await ctx.db.get(sentence.meetingID);
      if (meeting && meeting.userId) {
        // Update the finalizedSentence document with the userId
        await ctx.db.patch(sentence._id, {
          userId: meeting.userId,
        });
      }
    }
  },
});

export const createEmbeddingsforFinalizedSentencesInMeetingID = action({
  args: { meetingId: v.id("meetings") },
  handler: async (ctx, args) => {
    const sentences: FinalizedSentence[] = await ctx.runQuery(
      internal.generateEmbeddings.fetchFinalizedSentencesByMeetingId,
      {
        meetingId: args.meetingId,
      }
    );

    for (const sentence of sentences) {
      // Generate and save the embedding
      await ctx.runAction(api.transcript.generateAndSaveEmbedding, {
        finalizedSentenceId: sentence._id,
        transcript: sentence.transcript,
        meetingID: sentence.meetingID,
      });
    }
    console.log(`Generated embeddings for ${sentences.length} sentences`);

    return sentences.length;
  },
});

export const fetchFinalizedSentencesByMeetingId = internalQuery({
  args: { meetingId: v.id("meetings") },
  handler: async (ctx, args) => {
    const results = await ctx.db
      .query("finalizedSentences")
      .withIndex("by_meetingID", (q) => q.eq("meetingID", args.meetingId))
      .collect();
    return results;
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
      internal.generateEmbeddings.addEmbedding,
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

//Sript to generate embeddings for all sentences without embeddings

// export const getAllSentences = query({
//   handler: async (ctx) => {
//     return await ctx.db.query("finalizedSentences").collect();
//   },
// });

// export const getSentencesWithoutEmbeddings = query({
//   args: {},
//   handler: async (ctx, args) => {
//     //   const user = await ctx.auth.getUserIdentity();

//     //   if (!user) {
//     //     throw new Error("Please login to create send a message");
//     //   }

//     return await ctx.db
//       .query("finalizedSentences")
//       .filter((q) => q.eq(q.field("sentenceEmbeddingId"), undefined))
//       .collect();
//   },
// });

// export const getSentencesWithEmbeddings = query({
//   args: {},
//   handler: async (ctx, args) => {
//     // const user = await ctx.auth.getUserIdentity();

//     // if (!user) {
//     //   throw new Error("Please login to create send a message");
//     // }

//     return await ctx.db
//       .query("finalizedSentences")
//       .filter((q) => q.neq(q.field("sentenceEmbeddingId"), undefined))
//       .collect();
//   },
// });

// // New action to generate embeddings for all sentences without embeddings
// export const generateEmbeddingsForAll = action({
//   args: {},
//   handler: async (ctx, args) => {
//     // Fetch all sentences without embeddings
//     const sentencesWithoutEmbeddings = await ctx.runQuery(
//       api.generateEmbeddings.getSentencesWithoutEmbeddings,
//       {}
//     );

//     // Iterate over each sentence and call generateAndSaveEmbedding
//     for (const sentence of sentencesWithoutEmbeddings) {
//       // Assuming `transcript` and `meetingID` are fields in your sentence documents
//       await ctx.runAction(api.transcript.generateAndSaveEmbedding, {
//         finalizedSentenceId: sentence._id,
//         transcript: sentence.transcript,
//         meetingID: sentence.meetingID,
//       });
//     }
//   },
// });
