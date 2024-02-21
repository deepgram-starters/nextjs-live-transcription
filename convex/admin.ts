// import { v } from "convex/values";
// import { action, mutation, query } from "./_generated/server";
// import { api } from "./_generated/api";

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
//       api.admin.getSentencesWithoutEmbeddings,
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
