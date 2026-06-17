import { prisma } from "../config/prisma.js";
import { aiService } from "./ai.service.js";

export const reviewService = {
  async create(input: {
    business: string;
    user: string;
    rating: number;
    title: string;
    text: string;
    photos?: string[];
    videos?: string[];
  }) {
    const ai = await aiService.analyzeReview(input.text);
    return prisma.review.create({
      data: {
        businessId: input.business,
        userId: input.user,
        rating: input.rating,
        title: input.title,
        text: input.text,
        photos: input.photos ?? [],
        videos: input.videos ?? [],
        sentiment: ai.sentiment,
        spamRisk: ai.spamRisk,
        toxicityRisk: ai.toxicityRisk,
        aiReasons: ai.reasons ?? [],
        status: ai.spamRisk === "high" || ai.toxicityRisk === "high" ? "pending" : "approved"
      }
    });
  },

  async listForBusiness(business: string, sort = "latest") {
    const sortMap: Record<string, Record<string, "asc" | "desc">> = {
      latest: { createdAt: "desc" },
      highest: { rating: "desc" },
      lowest: { rating: "asc" },
      helpful: { helpfulCount: "desc" }
    };
    return prisma.review.findMany({
      where: { businessId: business, status: "approved" },
      include: { user: { select: { name: true, avatarUrl: true, reputationPoints: true, badges: true } } },
      orderBy: sortMap[sort] ?? sortMap.latest
    });
  }
};
