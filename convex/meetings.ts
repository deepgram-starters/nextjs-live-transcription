import { v } from "convex/values";

import { mutation, query } from "./_generated/server";

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
