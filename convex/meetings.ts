import { v } from "convex/values";
import { action, mutation, query } from "./_generated/server";
import { api } from "./_generated/api";

export const createMeeting = mutation({
  args: {
    title: v.string(),
    // Additional arguments can be added here
  },
  handler: async (ctx, args) => {
    const user = await ctx.auth.getUserIdentity();

    if (!user) {
      throw new Error("Please login to create a meeting");
    }

    // Insert the new meeting and capture the returned ID
    const meetingId = await ctx.db.insert("meetings", {
      title: args.title,
      userId: user.subject,
      duration: 0,
      isFavorite: false,
      isDeleted: false,
      // Additional fields can be added here
    });

    // Return the meeting ID so it can be used by the client
    return { meetingId };
  },
});

export const getMeetingsForUser = query({
  args: {},
  handler: async (ctx, args) => {
    const user = await ctx.auth.getUserIdentity();

    if (!user) {
      throw new Error("Please login to retrieve list of meetings");
    }

    return await ctx.db
      .query("meetings")
      .filter((q) => q.eq(q.field("userId"), user.subject))
      .order("desc")
      .collect();
  },
});

export const getMeetingByID = query({
  args: {
    meetingID: v.id("meetings"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.auth.getUserIdentity();

    if (!user) {
      throw new Error("Please login to retrieve a meeting");
    }

    return await ctx.db
      .query("meetings")
      .filter((q) => q.eq(q.field("userId"), user.subject))
      .filter((q) => q.eq(q.field("_id"), args.meetingID)) // Add this line to filter by meetingID

      .collect();
  },
});

export const addSpeaker = mutation({
  args: {
    meetingID: v.id("meetings"),
    speakerNumber: v.number(),
    firstName: v.string(),
    lastName: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.auth.getUserIdentity();

    if (!user) {
      throw new Error("Please login to create a meeting");
    }

    await ctx.db.insert("speakers", {
      meetingID: args.meetingID,
      speakerNumber: args.speakerNumber,
      firstName: args.firstName,
      lastName: args.lastName,
    });
  },
});

export const updateMeetingTitle = mutation({
  args: {
    meetingID: v.id("meetings"),
    newTitle: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.auth.getUserIdentity();

    if (!user) {
      throw new Error("Please login to update the meeting");
    }

    // Use db.patch to update the meeting title
    await ctx.db.patch(args.meetingID, {
      title: args.newTitle,
    });
  },
});

export const getSpeakersByMeeting = query({
  args: { meetingID: v.id("meetings") },
  async handler({ db }, { meetingID }) {
    return await db
      .query("speakers")
      .filter((q) => q.eq(q.field("meetingID"), meetingID))
      .collect();
  },
});

export const updateMeetingDetails = mutation({
  args: {
    meetingID: v.id("meetings"),
    updates: v.object({
      newTitle: v.optional(v.string()),
      duration: v.optional(v.float64()),
      isFavorite: v.optional(v.boolean()),
      isDeleted: v.optional(v.boolean()),
      date: v.optional(v.string()), // Add this line to include a date field
    }),
  },
  handler: async (ctx, args) => {
    const user = await ctx.auth.getUserIdentity();

    if (!user) {
      throw new Error("Please login to update the meeting");
    }

    const updates: {
      title?: string;
      duration?: number;
      isFavorite?: boolean;
      isDeleted?: boolean;
    } = {};
    if (args.updates.newTitle !== undefined) {
      updates.title = args.updates.newTitle;
    }
    if (args.updates.duration !== undefined) {
      updates.duration = args.updates.duration;
    }
    if (args.updates.isFavorite !== undefined) {
      updates.isFavorite = args.updates.isFavorite;
    }
    if (args.updates.isDeleted !== undefined) {
      updates.isDeleted = args.updates.isDeleted;
    }
    await ctx.db.patch(args.meetingID, updates);
  },
});

export const deleteMeetingAndRelatedRecords = mutation({
  args: { meetingId: v.id("meetings") },
  handler: async (ctx, { meetingId }) => {
    // Example for finalizedSentences, repeat for other related collections
    const finalizedSentences = await ctx.db
      .query("finalizedSentences")
      .filter((q) => q.eq(q.field("meetingID"), meetingId))
      .collect();
    for (const record of finalizedSentences) {
      await ctx.db.delete(record._id); // Correct usage: delete by _id
    }

    // Correctly delete related records from messages
    const messages = await ctx.db
      .query("messages")
      .filter((q) => q.eq(q.field("meetingID"), meetingId))
      .collect();
    for (const record of messages) {
      await ctx.db.delete(record._id);
    }

    // Correctly delete related records from speakers
    const speakers = await ctx.db
      .query("speakers")
      .filter((q) => q.eq(q.field("meetingID"), meetingId))
      .collect();
    for (const record of speakers) {
      await ctx.db.delete(record._id);
    }

    // Correctly delete related records from meetingSummaries
    const meetingSummaries = await ctx.db
      .query("meetingSummaries")
      .filter((q) => q.eq(q.field("meetingID"), meetingId))
      .collect();
    for (const record of meetingSummaries) {
      await ctx.db.delete(record._id);
    }

    // Delete related wordDetails
    const wordDetails = await ctx.db
      .query("wordDetails")
      .filter((q) => q.eq(q.field("meetingID"), meetingId))
      .collect();
    for (const record of wordDetails) {
      await ctx.db.delete(record._id);
    }

    // Delete related questions
    const questions = await ctx.db
      .query("questions")
      .filter((q) => q.eq(q.field("meetingID"), meetingId))
      .collect();
    for (const record of questions) {
      await ctx.db.delete(record._id);
    }

    // Delete related audioFiles
    const audioFiles = await ctx.db
      .query("audioFiles")
      .filter((q) => q.eq(q.field("meetingID"), meetingId))
      .collect();
    for (const record of audioFiles) {
      await ctx.db.delete(record._id);
    }

    // Finally, delete the meeting itself
    await ctx.db.delete(meetingId);
  },
});
