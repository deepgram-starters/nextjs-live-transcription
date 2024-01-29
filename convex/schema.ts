import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  meetings: defineTable({
    title: v.string(),
    userId: v.string(),
  }),
  messages: defineTable({
    aiResponse: v.string(),
    completionTokens: v.float64(),
    meetingID: v.id("meetings"),
    promptTokens: v.float64(),
    userId: v.string(),
    userMessage: v.string(),
  }),
});
