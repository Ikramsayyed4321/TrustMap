import { prisma } from "../config/prisma.js";
import { aiService } from "../services/ai.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const aiController = {
  analyzeReview: asyncHandler(async (req, res) => {
    const review = await prisma.review.findUnique({ where: { id: req.params.id } });
    const ai = await aiService.analyzeReview(review?.text ?? req.body.text);
    if (review) {
      await prisma.review.update({
        where: { id: review.id },
        data: {
          sentiment: ai.sentiment,
          spamRisk: ai.spamRisk,
          toxicityRisk: ai.toxicityRisk,
          aiReasons: ai.reasons ?? []
        }
      });
    }
    res.json(ai);
  }),

  summarizeBusiness: asyncHandler(async (req, res) => {
    const reviews = await prisma.review.findMany({
      where: { businessId: req.params.id, status: "approved" },
      select: { rating: true, text: true },
      take: 100
    });
    const summary = await aiService.summarizeReviews(reviews);
    const saved = await prisma.aiSummary.upsert({
      where: { businessId: req.params.id },
      update: { ...summary, reviewCount: reviews.length },
      create: { ...summary, businessId: req.params.id, reviewCount: reviews.length }
    });
    await prisma.business.update({ where: { id: req.params.id }, data: { aiSummary: saved.summary } });
    res.json(saved);
  }),

  searchIntent: asyncHandler(async (req, res) => {
    res.json(await aiService.parseSearchIntent(req.body.query));
  })
};
