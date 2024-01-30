import { v } from "convex/values";
import { action, mutation, query } from "./_generated/server";
import { api } from "./_generated/api";

import OpenAI from "openai";
const openai = new OpenAI();

export const sendMessage = action({
  args: {
    message: v.string(),
    meetingID: v.string(),
    aiModel: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.auth.getUserIdentity();

    if (!user) {
      throw new Error("Please login to create a meeting");
    }

    // Choose the OpenAI model based on the user's selection
    const aiModel =
      args.aiModel === "4.0" ? "gpt-4-0125-preview" : "gpt-3.5-turbo";

    // Store the initial message and get its ID
    const messageId = await ctx.runMutation(api.chat.storeMessagesStreaming, {
      userMessage: args.message,
      meetingID: args.meetingID,
      aiModel: aiModel,
    });

    if (Array.isArray(messageId)) {
      throw new Error("Message ID should not be an array");
    }

    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: args.message }],
      model: aiModel,
      stream: true,
    });

    let aiResponse = "";
    let completionTokens = 0; // Initialize chunk count
    for await (const chunk of completion) {
      const part = chunk.choices[0].delta.content; // Note the change here to delta.content
      console.log(chunk);
      if (part) {
        aiResponse += part;
        completionTokens++;

        await ctx.runMutation(api.chat.updateAIResponse, {
          messageId: messageId,
          aiResponse: aiResponse,
          completionTokens: completionTokens,
        });
      }
    }

    // Return the final response
    return aiResponse;
  },
});

// works for streaming=false
export const storeMessages = mutation({
  args: {
    userMessage: v.string(),
    aiResponse: v.string(),
    completionTokens: v.number(),
    promptTokens: v.number(),
    meetingID: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.auth.getUserIdentity();

    if (!user) {
      return [];
    }

    await ctx.db.insert("messages", {
      userId: user.subject,
      userMessage: args.userMessage,
      aiResponse: args.aiResponse,
      completionTokens: args.completionTokens,
      promptTokens: args.promptTokens,
      //@ts-ignore
      meetingID: v.string(),
    });
  },
});

// trying to get to work for streaming=true
export const storeMessagesStreaming = mutation({
  args: {
    userMessage: v.string(),
    meetingID: v.string(),
    aiModel: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.auth.getUserIdentity();

    if (!user) {
      return [];
    }

    const messageId = await ctx.db.insert("messages", {
      userId: user.subject,
      //@ts-ignore
      meetingID: args.meetingID,
      userMessage: args.userMessage,
      aiModel: args.aiModel,
      aiResponse: "", // Initially empty, to be updated as the AI response streams in
      completionTokens: 0, // Default value, can be updated later
      promptTokens: 0, // Default value, can be updated later
    });

    return messageId; // Return the ID of the newly created message for future updates
  },
});

export const updateAIResponse = mutation({
  args: {
    messageId: v.string(),
    aiResponse: v.string(),
    completionTokens: v.number(),
  },
  handler: async (ctx, args) => {
    //@ts-ignore
    await ctx.db.patch(args.messageId, {
      aiResponse: args.aiResponse,
      completionTokens: args.completionTokens,
    });
  },
});

//works for streaming=false
export const getMessagesForUser = query({
  args: {
    meetingID: v.id("meetings"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.auth.getUserIdentity();

    if (!user) {
      return [];
    }

    return await ctx.db
      .query("messages")
      .filter((q) => q.eq(q.field("userId"), user.subject))
      .filter((q) => q.eq(q.field("meetingID"), args.meetingID)) // Add this line to filter by meetingID

      .collect();
  },
});
