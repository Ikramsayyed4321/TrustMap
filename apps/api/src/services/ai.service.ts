import OpenAI from "openai";
import { env } from "../config/env.js";

const client = env.OPENAI_API_KEY ? new OpenAI({ apiKey: env.OPENAI_API_KEY }) : null;
const model = env.OPENAI_MODEL || "gpt-4o-mini";

function fallbackAnalyze(text: string) {
  const lower = text.toLowerCase();
  const negative = ["bad", "terrible", "awful", "slow", "dirty", "rude"].some((word) => lower.includes(word));
  const positive = ["great", "excellent", "amazing", "clean", "friendly", "best"].some((word) => lower.includes(word));
  return {
    sentiment: negative ? "negative" : positive ? "positive" : "neutral",
    spamRisk: lower.length < 20 ? "medium" : "low",
    toxicityRisk: "low",
    reasons: client ? [] : ["OpenAI API key not configured; heuristic fallback used."]
  } as const;
}

export const aiService = {
  async analyzeReview(text: string) {
    if (!client) return fallbackAnalyze(text);

    const response = await client.chat.completions.create({
      model,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "Classify a local-business review. Return JSON with sentiment positive|neutral|negative, spamRisk low|medium|high, toxicityRisk low|medium|high, and reasons string array."
        },
        { role: "user", content: text }
      ]
    });

    return JSON.parse(response.choices[0]?.message.content || "{}");
  },

  async summarizeReviews(reviews: Array<{ rating: number; text: string }>) {
    if (!client || reviews.length === 0) {
      return {
        summary: reviews.length
          ? "Reviews are available, but AI summary generation is not configured."
          : "No approved reviews are available yet.",
        highlights: [],
        concerns: []
      };
    }

    const response = await client.chat.completions.create({
      model,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "Summarize local-business reviews. Return JSON with summary string, highlights string array, concerns string array. Keep summary under 35 words."
        },
        { role: "user", content: JSON.stringify(reviews.slice(0, 100)) }
      ]
    });

    return JSON.parse(response.choices[0]?.message.content || "{}");
  },

  async parseSearchIntent(query: string) {
    if (!client) return { query, filters: {}, keywords: query.split(/\s+/).filter(Boolean) };

    const response = await client.chat.completions.create({
      model,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "Parse a local-business search query into JSON: query, category, city, amenities array, priceRange, minRating, openNow boolean, keywords array."
        },
        { role: "user", content: query }
      ]
    });

    return JSON.parse(response.choices[0]?.message.content || "{}");
  }
};
