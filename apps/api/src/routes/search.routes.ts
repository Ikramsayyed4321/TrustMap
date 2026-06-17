import { Router } from "express";
import { searchController } from "../controllers/search.controller.js";

export const searchRoutes = Router();

searchRoutes.get("/", searchController.search);
searchRoutes.get("/autocomplete", searchController.autocomplete);
searchRoutes.get("/osm/nearby", searchController.osmNearby);
searchRoutes.get("/osm/autocomplete", searchController.osmAutocomplete);
searchRoutes.get("/osm/route", searchController.osmRoute);
searchRoutes.post("/osm/places/:id/view", searchController.osmTrackView);
searchRoutes.get("/trending", searchController.trending);
searchRoutes.post("/smart", searchController.smart);
