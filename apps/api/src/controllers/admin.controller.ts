import { StatusCodes } from "http-status-codes";
import { prisma } from "../config/prisma.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AppError } from "../utils/AppError.js";

const publicUserSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  isEmailVerified: true,
  isBanned: true,
  reputationPoints: true,
  lastLoginAt: true,
  createdAt: true,
  updatedAt: true
};

export const adminController = {
  analytics: asyncHandler(async (_req, res) => {
    const [totalUsers, reviewers, owners, admins, totalReviews, totalBusinesses, openReports, recentUsers, recentReviews] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: "reviewer" } }),
      prisma.user.count({ where: { role: "owner" } }),
      prisma.user.count({ where: { role: "admin" } }),
      prisma.review.count(),
      prisma.business.count(),
      prisma.report.count({ where: { status: "open" } }),
      prisma.user.findMany({
        orderBy: { createdAt: "desc" },
        take: 8,
        select: publicUserSelect
      }),
      prisma.review.findMany({
        orderBy: { createdAt: "desc" },
        take: 8,
        include: { user: { select: { name: true } }, business: { select: { name: true } } }
      })
    ]);

    res.json({
      totals: { users: totalUsers, reviewers, owners, admins, reviews: totalReviews, businesses: totalBusinesses, openReports },
      revenue: { mrr: 0, sponsoredListings: 0, ownerSubscriptions: 0 },
      recentUsers,
      recentReviews
    });
  }),

  users: asyncHandler(async (_req, res) => {
    res.json(await prisma.user.findMany({ orderBy: { createdAt: "desc" }, take: 100, select: publicUserSelect }));
  }),

  banUser: asyncHandler(async (req, res) => {
    res.json(await prisma.user.update({ where: { id: req.params.id }, data: { isBanned: true }, select: publicUserSelect }));
  }),

  updateUserRole: asyncHandler(async (req, res) => {
    const role = req.body.role;
    if (!["admin", "reviewer", "owner"].includes(role)) {
      throw new AppError(StatusCodes.BAD_REQUEST, "Role must be admin, reviewer, or owner");
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.params.id },
      data: { role },
      select: publicUserSelect
    });

    res.json(updatedUser);
  }),

  moderationQueue: asyncHandler(async (_req, res) => {
    res.json(
      await prisma.review.findMany({
        where: { status: "pending" },
        include: { user: { select: { name: true } }, business: { select: { name: true } } }
      })
    );
  }),

  setReviewStatus: asyncHandler(async (req, res) => {
    res.json(await prisma.review.update({ where: { id: req.params.id }, data: { status: req.body.status } }));
  }),

  reports: asyncHandler(async (_req, res) => {
    res.json(
      await prisma.report.findMany({
        include: { review: true, reporter: { select: publicUserSelect } },
        orderBy: { createdAt: "desc" }
      })
    );
  })
};

