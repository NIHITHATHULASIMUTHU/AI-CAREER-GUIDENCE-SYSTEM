import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const createProfile = mutation({
  args: {
    interests: v.string(),
    skills: v.string(),
    knowledge: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User must be authenticated");
    }

    const profileId = await ctx.db.insert("profiles", {
      userId,
      interests: args.interests,
      skills: args.skills,
      knowledge: args.knowledge,
      createdAt: Date.now(),
    });

    return profileId;
  },
});

export const getUserProfiles = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    return await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

export const getProfile = query({
  args: { profileId: v.id("profiles") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User must be authenticated");
    }

    const profile = await ctx.db.get(args.profileId);
    if (!profile || profile.userId !== userId) {
      throw new Error("Profile not found or access denied");
    }

    return profile;
  },
});
