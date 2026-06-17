import { prisma } from "../config/prisma.js";

export const businessService = {
  async search(query: Record<string, any>) {
    const filter: Record<string, any> = {};
    if (query.category) filter.categoryId = query.category;
    if (query.verifiedOnly === "true") filter.verified = true;
    if (query.minRating) filter.averageRating = { gte: Number(query.minRating) };
    if (query.city) filter.city = { contains: String(query.city) };
    if (query.q) {
      const q = String(query.q);
      filter.OR = [
        { name: { contains: q } },
        { address: { contains: q } },
        { city: { contains: q } }
      ];
    }

    const page = Math.max(Number(query.page ?? 1), 1);
    const limit = Math.min(Math.max(Number(query.limit ?? 20), 1), 50);

    return prisma.business.findMany({
      where: filter,
      include: { category: true, owner: { select: { id: true, name: true, avatarUrl: true } } },
      orderBy: query.sort === "mostReviewed" ? [{ totalReviews: "desc" }] : [{ trendingScore: "desc" }, { averageRating: "desc" }],
      skip: (page - 1) * limit,
      take: limit
    });
  },

  async nearby(id: string, maxDistance = 5000) {
    const business = await prisma.business.findUnique({ where: { id } });
    if (!business) return [];
    const maxDegrees = maxDistance / 111_320;
    return prisma.business.findMany({
      where: {
        id: { not: id },
        latitude: { gte: business.latitude - maxDegrees, lte: business.latitude + maxDegrees },
        longitude: { gte: business.longitude - maxDegrees, lte: business.longitude + maxDegrees }
      },
      take: 12
    });
  },

  async recalculateRating(businessId: string) {
    return prisma.review.groupBy({
      by: ["rating"],
      where: { businessId, status: "approved" },
      _count: { rating: true }
    });
  }
};

