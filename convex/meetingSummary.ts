import { v } from "convex/values";
import { action, mutation, query } from "./_generated/server";
import { api } from "./_generated/api";

import OpenAI from "openai";
const openai = new OpenAI();

export const retrieveMeetingSummary = action({
  args: {
    message: v.string(),
    meetingID: v.id("meetings"),
    aiModel: v.string(),
    // chatHistory: v.array(v.object({ role: v.string(), content: v.string() })),
    // Optional arguments for finalized sentences and speaker details
    finalizedSentences: v.optional(
      v.array(
        v.object({
          speaker: v.number(),
          transcript: v.string(),
          start: v.number(),
          end: v.number(),
          meetingID: v.string(), // Ensure this matches your data model
        })
      )
    ),
    speakerDetails: v.optional(
      v.array(
        v.object({
          speakerNumber: v.number(),
          firstName: v.string(),
          lastName: v.string(),
        })
      )
    ),
  },
  handler: async (ctx, args) => {
    const user = await ctx.auth.getUserIdentity();

    if (!user) {
      throw new Error("Please login to create send a message");
    }

    // Choose the OpenAI model based on the user's selection
    const aiModel =
      args.aiModel === "4.0" ? "gpt-4-0125-preview" : "gpt-3.5-turbo";
    // create meetingSummary and get its ID
    const messageId = await ctx.runMutation(
      api.meetingSummary.storeMeetingSummaryStreaming,
      {
        meetingID: args.meetingID,
        aiModel: aiModel,
        summary: "",
      }
    );

    if (Array.isArray(messageId)) {
      throw new Error("Message ID should not be an array");
    }

    // Append the new message to the chat history
    // const fullChatHistory = args.chatHistory
    //   .map((entry) => ({
    //     role: entry.role as "user" | "assistant", // Adjust this casting as necessary
    //     content: entry.content,
    //   }))
    //   .concat({
    //     role: "user", // Assuming the new message is always from the user
    //     content: args.message,
    //   });

    const fullChatHistory = [];

    if (args.finalizedSentences && args.finalizedSentences.length > 0) {
      // Construct a special system message for the transcript
      const transcriptMessage = {
        role: "system",
        content:
          "you are a helpful assistant helping the user answer questions about a meeting transcript.",
      };

      // Construct a message for the transcript details
      const transcriptDetailsMessage = {
        role: "user",
        content:
          "The following is the output from a speech to text transcript of a meeting. I need to send out the meeting notes, Please provide:  1. 150 word Executive Summary 2. Additional Details in outline format 3. Any Decisions Made 4. Any Action Items & Owners  Here is the transcript:\n\ntranscript:\n" +
            args.finalizedSentences
              .map(
                (s) => `speaker: ${s.speaker} - transcript: '${s.transcript}'`
              )
              .join("\n") +
            "\n\nspeaker table:\n" +
            args.speakerDetails
              ?.map(
                (d) =>
                  `firstName: '${d.firstName}', lastName: '${d.lastName}', speakerNumber: ${d.speakerNumber}`
              )
              .join("\n") || "",
      };

      // Append these special messages to the beginning of the chat history
      fullChatHistory.unshift(
        { ...transcriptMessage, role: "system" as "user" | "assistant" },
        { ...transcriptDetailsMessage, role: "user" as "user" | "assistant" }
      );
    }

    // console.log("fullChatHistory:", fullChatHistory);

    const completion = await openai.chat.completions.create({
      model: aiModel,
      messages: fullChatHistory, // include transctipt if available
      stream: true,
    });

    let aiResponse = "";
    let completionTokens = 0; // Initialize chunk count
    for await (const chunk of completion) {
      const part = chunk.choices[0].delta.content; // Note the change here to delta.content
      // console.log(chunk);
      if (part) {
        aiResponse += part;
        completionTokens++;

        await ctx.runMutation(api.meetingSummary.updateAIResponse, {
          meetingSummariesID: messageId,
          aiSummary: aiResponse,
          completionTokens: completionTokens,
        });
      }
    }

    // Return the final response
    return aiResponse;
  },
});

export const storeMeetingSummaryStreaming = mutation({
  args: {
    meetingID: v.id("meetings"),
    aiModel: v.string(),
    summary: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.auth.getUserIdentity();

    if (!user) {
      return [];
    }

    const meetingSummariesID = await ctx.db.insert("meetingSummaries", {
      userId: user.subject,
      meetingID: args.meetingID,
      aiModel: args.aiModel,
      aiSummary: "", // Initially empty, to be updated as the AI response streams in
      completionTokens: 0, // Default value, can be updated later
      promptTokens: 0, // Default value, can be updated later
    });

    return meetingSummariesID; // Return the ID of the newly created message for future updates
  },
});

export const updateAIResponse = mutation({
  args: {
    meetingSummariesID: v.id("meetingSummaries"),
    aiSummary: v.string(),
    completionTokens: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.meetingSummariesID, {
      aiSummary: args.aiSummary,
      completionTokens: args.completionTokens,
    });
  },
});

// ALERT: Dissabled for now convex says we are over a gb in client requests
// export const getMeetingSummaryForUser = query({
//   args: {
//     meetingID: v.id("meetings"),
//   },
//   handler: async (ctx, args) => {
//     const user = await ctx.auth.getUserIdentity();

//     if (!user) {
//       return [];
//     }

//     return await ctx.db
//       .query("meetingSummaries")
//       .filter((q) => q.eq(q.field("userId"), user.subject))
//       .filter((q) => q.eq(q.field("meetingID"), args.meetingID)) // Add this line to filter by meetingID

//       .collect();
//   },
// });
