import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  finalizedSentences: defineTable({
    end: v.float64(),
    meetingID: v.id("meetings"),
    speaker: v.number(),
    start: v.float64(),
    transcript: v.string(),
  }).index("by_meetingID", ["meetingID"]),
  meetings: defineTable({
    title: v.string(),
    userId: v.string(),
    duration: v.float64(),
    isFavorite: v.boolean(),
    isDeleted: v.boolean(),
  })
    .index("by_userId", ["userId"])
    .index("by_userId_isFavorite", ["userId", "isFavorite"]),

  messages: defineTable({
    aiModel: v.string(),
    aiResponse: v.string(),
    completionTokens: v.float64(),
    meetingID: v.id("meetings"),
    promptTokens: v.float64(),
    userId: v.string(),
    userMessage: v.string(),
  })
    .index("by_meetingID", ["meetingID"])
    .index("by_userId_meetingID", ["userId", "meetingID"]),

  speakers: defineTable({
    meetingID: v.id("meetings"),
    speakerNumber: v.number(),
    firstName: v.string(),
    lastName: v.string(),
  }).index("by_meetingID", ["meetingID"]),
  meetingSummaries: defineTable({
    aiModel: v.string(),
    userId: v.string(),
    meetingID: v.id("meetings"),
    aiSummary: v.string(),
    completionTokens: v.float64(),
    promptTokens: v.float64(),
  })
    .index("by_meetingID", ["meetingID"])
    .index("by_userId_meetingID", ["userId", "meetingID"]),
  questions: defineTable({
    question: v.string(),
    timestamp: v.float64(),
    speaker: v.number(),
    meetingID: v.id("meetings"),
  }).index("by_meetingID", ["meetingID"]),
});