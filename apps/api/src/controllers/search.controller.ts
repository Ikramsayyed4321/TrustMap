import { prisma } from "../config/prisma.js";
import { aiService } from "../services/ai.service.js";
import { businessService } from "../services/business.service.js";
import { osmPlacesService } from "../services/osmPlaces.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const searchController = {
  search: asyncHandler(async (req, res) => {
    res.json(await businessService.search(req.query));
  }),

  autocomplete: asyncHandler(async (req, res) => {
    const q = String(req.query.q ?? "");
    const results = await prisma.business.findMany({
      where: { name: { contains: q } },
      select: { id: true, name: true, city: true, category: true },
      take: 8
    });
    res.json(results);
  }),

  osmNearby: asyncHandler(async (req, res) => {
    const lat = req.query.lat ? Number(req.query.lat) : undefined;
    const lng = req.query.lng ? Number(req.query.lng) : undefined;
    const radius = req.query.radius ? Number(req.query.radius) : undefined;
    const minRating = req.query.minRating ? Number(req.query.minRating) : undefined;
    const keyword = String(req.query.keyword ?? "").trim();

    res.json(
      await osmPlacesService.nearby({
        keyword,
        lat,
        lng,
        radius,
        minRating,
        city: req.query.city ? String(req.query.city) : undefined,
        category: req.query.category ? String(req.query.category) : undefined,
        openNow: req.query.openNow === "true",
        offset: req.query.offset ? Number(req.query.offset) : undefined,
        limit: req.query.limit ? Number(req.query.limit) : undefined,
        sort: req.query.sort ? String(req.query.sort) : undefined
      })
    );
  }),

  osmAutocomplete: asyncHandler(async (req, res) => {
    res.json(
      await osmPlacesService.autocomplete(
        String(req.query.input ?? ""),
        req.query.lat ? Number(req.query.lat) : undefined,
        req.query.lng ? Number(req.query.lng) : undefined
      )
    );
  }),

  osmRoute: asyncHandler(async (req, res) => {
    res.json(
      await osmPlacesService.route(
        { lat: Number(req.query.fromLat), lng: Number(req.query.fromLng) },
        { lat: Number(req.query.toLat), lng: Number(req.query.toLng) }
      )
    );
  }),

  osmTrackView: asyncHandler(async (req, res) => {
    res.json(await osmPlacesService.trackView(req.params.id));
  }),

  trending: asyncHandler(async (_req, res) => {
    res.json(await osmPlacesService.trending());
  }),

  smart: asyncHandler(async (req, res) => {
    const intent = await aiService.parseSearchIntent(req.body.query);
    const results = await businessService.search({ ...intent, q: intent.query ?? req.body.query });
    res.json({ intent, results });
  })
};

