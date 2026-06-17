import { StatusCodes } from "http-status-codes";
import { prisma } from "../config/prisma.js";
import { businessService } from "../services/business.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const businessController = {
  list: asyncHandler(async (req, res) => {
    res.json(await businessService.search(req.query));
  }),

  create: asyncHandler(async (req, res) => {
    const { location, category, owner, ...body } = req.body;
    const business = await prisma.business.create({
      data: {
        ...body,
        categoryId: body.categoryId ?? category,
        ownerId: body.ownerId ?? owner,
        latitude: body.latitude ?? location?.coordinates?.[1],
        longitude: body.longitude ?? location?.coordinates?.[0]
      }
    });
    res.status(StatusCodes.CREATED).json(business);
  }),

  get: asyncHandler(async (req, res) => {
    const business = await prisma.business.findUnique({
      where: { id: req.params.id },
      include: {
        category: true,
        owner: { select: { id: true, name: true, avatarUrl: true } }
      }
    });
    res.json(business);
  }),

  update: asyncHandler(async (req, res) => {
    const { location, category, owner, ...body } = req.body;
    const business = await prisma.business.update({
      where: { id: req.params.id },
      data: {
        ...body,
        categoryId: body.categoryId ?? category,
        ownerId: body.ownerId ?? owner,
        latitude: body.latitude ?? location?.coordinates?.[1],
        longitude: body.longitude ?? location?.coordinates?.[0]
      }
    });
    res.json(business);
  }),

  remove: asyncHandler(async (req, res) => {
    await prisma.business.delete({ where: { id: req.params.id } });
    res.status(StatusCodes.NO_CONTENT).send();
  }),

  nearby: asyncHandler(async (req, res) => {
    res.json(await businessService.nearby(req.params.id, Number(req.query.distance ?? 5000)));
  })
};
