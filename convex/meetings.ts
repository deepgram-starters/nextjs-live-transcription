import { v } from "convex/values";
import { action, mutation, query } from "./_generated/server";
import { api } from "./_generated/api";

export const createMeeting = mutation({
  args: {
    title: v.string(),
    // description: v.string(),
    // date: v.string(),
    // time: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.auth.getUserIdentity();

    if (!user) {
      throw new Error("Please login to create a meeting");
    }

    await ctx.db.insert("meetings", {
      title: args.title,
      userId: user.subject,
      duration: 0,
      //   description: args.description,
      //   date: args.date,
      //   time: args.time,
    });
  },
});

export const getMeetingsForUser = query({
  args: {},
  handler: async (ctx, args) => {
    const user = await ctx.auth.getUserIdentity();

    if (!user) {
      return [];
    }

    return await ctx.db
      .query("meetings")
      .filter((q) => q.eq(q.field("userId"), user.subject))
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
      return [];
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
    }),
  },
  handler: async (ctx, args) => {
    const user = await ctx.auth.getUserIdentity();

    if (!user) {
      throw new Error("Please login to update the meeting");
    }

    const updates: { title?: string; duration?: number } = {};
    if (args.updates.newTitle !== undefined) {
      updates.title = args.updates.newTitle;
    }
    if (args.updates.duration !== undefined) {
      updates.duration = args.updates.duration;
    }

    await ctx.db.patch(args.meetingID, updates);
  },
});
