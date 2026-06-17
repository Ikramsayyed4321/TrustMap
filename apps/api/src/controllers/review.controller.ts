import { StatusCodes } from "http-status-codes";
import { prisma } from "../config/prisma.js";
import { reviewService } from "../services/review.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const reviewController = {
  create: asyncHandler(async (req, res) => {
    const review = await reviewService.create({ ...req.body, user: req.user!.id });
    res.status(StatusCodes.CREATED).json(review);
  }),

  update: asyncHandler(async (req, res) => {
    const current = await prisma.review.findUnique({ where: { id: req.params.id } });
    const history = Array.isArray(current?.editHistory) ? current.editHistory : [];
    const review = current
      ? await prisma.review.update({
          where: { id: req.params.id },
          data: {
            ...req.body,
            editHistory: [...history, { title: current.title, text: current.text, editedAt: new Date().toISOString() }]
          }
        })
      : null;
    res.json(review);
  }),

  remove: asyncHandler(async (req, res) => {
    await prisma.review.delete({ where: { id: req.params.id } });
    res.status(StatusCodes.NO_CONTENT).send();
  }),

  listForBusiness: asyncHandler(async (req, res) => {
    res.json(await reviewService.listForBusiness(req.params.id, String(req.query.sort ?? "latest")));
  }),

  helpful: asyncHandler(async (req, res) => {
    const value = req.body.value === -1 ? -1 : 1;
    await prisma.reviewLike.upsert({
      where: { userId_reviewId: { userId: req.user!.id, reviewId: req.params.id } },
      update: { value },
      create: { userId: req.user!.id, reviewId: req.params.id, value }
    });
    await prisma.review.update({
      where: { id: req.params.id },
      data: value === 1 ? { helpfulCount: { increment: 1 } } : { dislikeCount: { increment: 1 } }
    });
    res.status(StatusCodes.NO_CONTENT).send();
  })
};
