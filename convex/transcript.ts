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
