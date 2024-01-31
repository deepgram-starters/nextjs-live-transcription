import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  finalizedSentences: defineTable({
    end: v.float64(),
    meetingID: v.id("meetings"),
    speaker: v.number(),
    start: v.float64(),
    transcript: v.string(),
  }),
  meetings: defineTable({
    title: v.string(),
    userId: v.string(),
  }),
  messages: defineTable({
    aiModel: v.string(),
    aiResponse: v.string(),
    completionTokens: v.float64(),
    meetingID: v.id("meetings"),
    promptTokens: v.float64(),
    userId: v.string(),
    userMessage: v.string(),
  }),
  speakers: defineTable({
    meetingID: v.id("meetings"),
    speakerNumber: v.number(),
    firstName: v.string(),
    lastName: v.string(),
  }),
  meetingSummaries: defineTable({
    aiModel: v.string(),
    userId: v.string(),
    meetingID: v.id("meetings"),
    aiSummary: v.string(),
    completionTokens: v.float64(),
    promptTokens: v.float64(),
  }),
});
