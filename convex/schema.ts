import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  profiles: defineTable({
    userId: v.id("users"),
    interests: v.string(),
    skills: v.string(),
    knowledge: v.string(),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),
  
  recommendations: defineTable({
    userId: v.id("users"),
    profileId: v.id("profiles"),
    careerOptions: v.array(v.object({
      letter: v.string(),
      careerName: v.string(),
      whyItMatches: v.string(),
      keyRequiredSkills: v.string(),
      futureGrowthLevel: v.string(),
    })),
    bestRecommendation: v.object({
      optionLetter: v.string(),
      reason: v.string(),
    }),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
