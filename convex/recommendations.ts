import { v } from "convex/values";
import { action, mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { api } from "./_generated/api";
import OpenAI from "openai";

const openai = new OpenAI({
  baseURL: process.env.CONVEX_OPENAI_BASE_URL,
  apiKey: process.env.CONVEX_OPENAI_API_KEY,
});

export const generateCareerRecommendations = action({
  args: {
    profileId: v.id("profiles"),
  },
  handler: async (ctx, args): Promise<{ recommendationId: any; rawResponse: string }> => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User must be authenticated");
    }

    const profile: any = await ctx.runQuery(api.profiles.getProfile, {
      profileId: args.profileId,
    });

    if (!profile) {
      throw new Error("Profile not found");
    }

    const prompt: string = `You are an Advanced AI Career Guidance System.

Carefully analyze the student's profile and generate structured career recommendations.

Student Profile:
Interests: ${profile.interests}
Skills: ${profile.skills}
Knowledge: ${profile.knowledge}

Instructions:

1. Identify the student's strongest domain.
2. Generate exactly 5 suitable career options.
3. Present them clearly in the format below with **bold** formatting for key terms.

**Career Options:**

**Option A:**
- **Career Name:** [Career Title]
- **Why it matches the profile:** [Detailed explanation]
- **Key Required Skills:** [List of skills]
- **Future Growth Level:** High / Medium / Low

**Option B:**
- **Career Name:** [Career Title]
- **Why it matches the profile:** [Detailed explanation]
- **Key Required Skills:** [List of skills]
- **Future Growth Level:** High / Medium / Low

**Option C:**
- **Career Name:** [Career Title]
- **Why it matches the profile:** [Detailed explanation]
- **Key Required Skills:** [List of skills]
- **Future Growth Level:** High / Medium / Low

**Option D:**
- **Career Name:** [Career Title]
- **Why it matches the profile:** [Detailed explanation]
- **Key Required Skills:** [List of skills]
- **Future Growth Level:** High / Medium / Low

**Option E:**
- **Career Name:** [Career Title]
- **Why it matches the profile:** [Detailed explanation]
- **Key Required Skills:** [List of skills]
- **Future Growth Level:** High / Medium / Low

4. After listing all 5 options, provide:

**Best Recommended Option:**
- **Option:** [Letter]
- **Reason:** [Detailed explanation why it is the strongest match]

5. Keep the tone professional, structured, and personalized.
6. Do not generate random careers. Base everything strictly on the profile provided.
7. Use **bold** formatting for all section headers and key terms.`;

    const response: any = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });

    const aiResponse: string | null = response.choices[0].message.content;
    if (!aiResponse) {
      throw new Error("Failed to generate recommendations");
    }

    // Parse the AI response to extract structured data
    const parsedRecommendations = parseAIResponse(aiResponse);

    // Save the recommendations to the database
    const recommendationId: any = await ctx.runMutation(api.recommendations.saveRecommendations, {
      profileId: args.profileId,
      careerOptions: parsedRecommendations.careerOptions,
      bestRecommendation: parsedRecommendations.bestRecommendation,
      rawResponse: aiResponse,
    });

    return { recommendationId, rawResponse: aiResponse };
  },
});

function parseAIResponse(response: string) {
  const careerOptions = [];
  
  // Updated regex to handle bold formatting
  const optionRegex = /\*\*Option ([A-E]):\*\*\s*\n- \*\*Career Name:\*\* (.+)\n- \*\*Why it matches the profile:\*\* (.+)\n- \*\*Key Required Skills:\*\* (.+)\n- \*\*Future Growth Level:\*\* (.+)/g;
  
  let match;
  while ((match = optionRegex.exec(response)) !== null) {
    careerOptions.push({
      letter: match[1],
      careerName: match[2].trim(),
      whyItMatches: match[3].trim(),
      keyRequiredSkills: match[4].trim(),
      futureGrowthLevel: match[5].trim(),
    });
  }

  // Extract best recommendation with bold formatting
  const bestRecommendationMatch = response.match(/\*\*Best Recommended Option:\*\*\s*\n- \*\*Option:\*\* (.+)\n- \*\*Reason:\*\* (.+)/);
  
  let bestRecommendation = {
    optionLetter: "A",
    reason: "Based on the strongest alignment with your profile",
  };

  if (bestRecommendationMatch) {
    bestRecommendation = {
      optionLetter: bestRecommendationMatch[1].trim(),
      reason: bestRecommendationMatch[2].trim(),
    };
  }

  return { careerOptions, bestRecommendation };
}

export const saveRecommendations = mutation({
  args: {
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
    rawResponse: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User must be authenticated");
    }

    return await ctx.db.insert("recommendations", {
      userId,
      profileId: args.profileId,
      careerOptions: args.careerOptions,
      bestRecommendation: args.bestRecommendation,
      createdAt: Date.now(),
    });
  },
});

export const getUserRecommendations = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    return await ctx.db
      .query("recommendations")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

export const getRecommendation = query({
  args: { recommendationId: v.id("recommendations") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User must be authenticated");
    }

    const recommendation = await ctx.db.get(args.recommendationId);
    if (!recommendation || recommendation.userId !== userId) {
      throw new Error("Recommendation not found or access denied");
    }

    return recommendation;
  },
});
