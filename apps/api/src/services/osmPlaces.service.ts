import { StatusCodes } from "http-status-codes";
import { MongoClient } from "mongodb";
import { env } from "../config/env.js";
import { AppError } from "../utils/AppError.js";

type NearbyParams = {
  keyword: string;
  lat?: number;
  lng?: number;
  city?: string;
  radius?: number;
  category?: string;
  minRating?: number;
  openNow?: boolean;
  offset?: number;
  limit?: number;
  sort?: string;
};

type OsmElement = {
  id: number;
  type: "node" | "way" | "relation";
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
};

type CacheEntry<T> = { expiresAt: number; data: T };

const cache = new Map<string, CacheEntry<unknown>>();
const analytics = new Map<string, { views: number; searches: number; lastSearchedAt: string }>();
let mongoClient: MongoClient | undefined;

const overpassUrl = "https://overpass-api.de/api/interpreter";
const nominatimUrl = "https://nominatim.openstreetmap.org";
const osrmUrl = "https://router.project-osrm.org/route/v1/driving";
const headers = { "User-Agent": "ReviewHub local discovery app (development)" };

async function analyticsCollection() {
  if (!env.MONGODB_URL) return undefined;
  mongoClient ??= new MongoClient(env.MONGODB_URL, { serverSelectionTimeoutMS: 1500 });
  await mongoClient.connect();
  return mongoClient.db(env.MONGODB_DB).collection("trending_analytics");
}

async function incrementAnalytics(placeId: string, field: "views" | "searches") {
  const searchedAt = new Date().toISOString();
  const current = analytics.get(placeId) ?? { views: 0, searches: 0, lastSearchedAt: searchedAt };
  analytics.set(placeId, { ...current, [field]: current[field] + 1, lastSearchedAt: searchedAt });

  const collection = await analyticsCollection().catch(() => undefined);
  if (collection) {
    await collection.updateOne(
      { placeId },
      { $inc: { [field]: 1 }, $set: { lastSearchedAt: searchedAt } },
      { upsert: true }
    );
  }
}

const categoryMap: Record<string, string[]> = {
  restaurant: ['amenity="restaurant"', 'amenity="fast_food"'],
  restaurants: ['amenity="restaurant"', 'amenity="fast_food"'],
  cafe: ['amenity="cafe"'],
  cafes: ['amenity="cafe"'],
  hotel: ['tourism="hotel"', 'tourism="guest_house"'],
  hotels: ['tourism="hotel"', 'tourism="guest_house"'],
  hospital: ['amenity="hospital"', 'amenity="clinic"'],
  hospitals: ['amenity="hospital"', 'amenity="clinic"'],
  school: ['amenity="school"', 'amenity="college"', 'amenity="university"'],
  schools: ['amenity="school"', 'amenity="college"', 'amenity="university"'],
  gym: ['leisure="fitness_centre"', 'amenity="gym"'],
  gyms: ['leisure="fitness_centre"', 'amenity="gym"'],
  shopping: ['shop'],
  pharmacy: ['amenity="pharmacy"', 'shop="chemist"'],
  "medical stores": ['amenity="pharmacy"', 'shop="chemist"'],
  salon: ['shop="hairdresser"', 'shop="beauty"'],
  salons: ['shop="hairdresser"', 'shop="beauty"'],
  park: ['leisure="park"'],
  parks: ['leisure="park"']
};

function getCached<T>(key: string) {
  const entry = cache.get(key) as CacheEntry<T> | undefined;
  if (!entry || entry.expiresAt < Date.now()) {
    cache.delete(key);
    return undefined;
  }
  return entry.data;
}

function setCached<T>(key: string, data: T, ttlMs = 1000 * 60 * 5) {
  cache.set(key, { data, expiresAt: Date.now() + ttlMs });
  return data;
}

function sanitize(value: string) {
  return value.replace(/[^\w\s-]/g, "").trim().slice(0, 80);
}

function distanceMeters(from: { lat: number; lng: number }, to: { lat: number; lng: number }) {
  const earthRadius = 6371000;
  const dLat = ((to.lat - from.lat) * Math.PI) / 180;
  const dLng = ((to.lng - from.lng) * Math.PI) / 180;
  const lat1 = (from.lat * Math.PI) / 180;
  const lat2 = (to.lat * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return Math.round(earthRadius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

function pseudoScore(id: string, min: number, max: number) {
  const seed = [...id].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return min + (seed % ((max - min) * 10)) / 10;
}

function selectorsFor(keyword: string, category?: string) {
  const normalized = sanitize(category && category !== "Any" ? category : keyword).toLowerCase();
  const mapped = categoryMap[normalized] ?? categoryMap[normalized.replace(/s$/, "")];
  if (mapped) return mapped;
  return [`name~"${sanitize(keyword)}",i`];
}

function queryFor(lat: number, lng: number, radius: number, keyword: string, category?: string) {
  const selectors = selectorsFor(keyword, category);
  const blocks = selectors
    .flatMap((selector) => [`node[${selector}](around:${radius},${lat},${lng});`, `way[${selector}](around:${radius},${lat},${lng});`, `relation[${selector}](around:${radius},${lat},${lng});`])
    .join("");
  return `[out:json][timeout:25];(${blocks});out center tags 80;`;
}

function normalize(element: OsmElement, origin: { lat: number; lng: number }) {
  const tags = element.tags ?? {};
  const location = element.lat && element.lon ? { lat: element.lat, lng: element.lon } : element.center ? { lat: element.center.lat, lng: element.center.lon } : origin;
  const id = `${element.type}-${element.id}`;
  const distance = distanceMeters(origin, location);
  const rating = Number(pseudoScore(id, 3.7, 5).toFixed(1));
  const reviewCount = Math.round(pseudoScore(`${id}-reviews`, 18, 420));
  const analyticsEntry = analytics.get(id);

  return {
    id,
    placeId: id,
    osmType: element.type,
    osmId: element.id,
    name: tags.name ?? tags.brand ?? "Unnamed place",
    address: [tags["addr:housenumber"], tags["addr:street"], tags["addr:city"]].filter(Boolean).join(", ") || tags["addr:full"] || "Address not available",
    distanceMeters: distance,
    distanceText: `${(distance / 1000).toFixed(distance < 1000 ? 2 : 1)} km`,
    category: tags.amenity ?? tags.shop ?? tags.tourism ?? tags.leisure ?? "local place",
    rating,
    reviewCount,
    openNow: tags.opening_hours ? null : null,
    openingHours: tags.opening_hours ?? null,
    phone: tags.phone ?? tags["contact:phone"] ?? null,
    website: tags.website ?? tags["contact:website"] ?? null,
    photoUrl: tags.image ?? null,
    description: tags.description ?? tags.note ?? "Community mapped place from OpenStreetMap.",
    location,
    tags,
    trendingScore: (analyticsEntry?.views ?? 0) * 2 + (analyticsEntry?.searches ?? 0) + rating * 10 + reviewCount / 10
  };
}

async function geocodeCity(city: string) {
  const key = `geocode:${city.toLowerCase()}`;
  const cached = getCached<{ lat: number; lng: number } | undefined>(key);
  if (cached) return cached;
  const params = new URLSearchParams({ q: sanitize(city), format: "json", limit: "1" });
  const response = await fetch(`${nominatimUrl}/search?${params}`, { headers });
  const data = (await response.json()) as Array<{ lat: string; lon: string }>;
  const result = data[0] ? { lat: Number(data[0].lat), lng: Number(data[0].lon) } : undefined;
  if (!result) throw new AppError(StatusCodes.BAD_REQUEST, "Could not find that city or location");
  return setCached(key, result, 1000 * 60 * 60);
}

export const osmPlacesService = {
  async nearby(params: NearbyParams) {
    const keyword = sanitize(params.keyword || params.category || "restaurant");
    const radius = Math.min(Math.max(params.radius ?? 5000, 1000), 25000);
    const origin = params.lat && params.lng ? { lat: params.lat, lng: params.lng } : await geocodeCity(params.city ?? "");
    const offset = Math.max(params.offset ?? 0, 0);
    const limit = Math.min(Math.max(params.limit ?? 20, 1), 40);
    const cacheKey = `nearby:${keyword}:${params.category}:${origin.lat.toFixed(4)}:${origin.lng.toFixed(4)}:${radius}`;
    const data =
      getCached<ReturnType<typeof normalize>[]>(cacheKey) ??
      setCached(
        cacheKey,
        await (async () => {
          const body = queryFor(origin.lat, origin.lng, radius, keyword, params.category);
          const response = await fetch(overpassUrl, { method: "POST", body, headers: { ...headers, "Content-Type": "text/plain" } });
          if (!response.ok) throw new AppError(StatusCodes.BAD_GATEWAY, "OpenStreetMap place search is temporarily unavailable");
          const payload = (await response.json()) as { elements?: OsmElement[] };
          return (payload.elements ?? []).map((element) => normalize(element, origin));
        })()
      );

    const searchedAt = new Date().toISOString();
    void searchedAt;
    data.forEach((place) => {
      incrementAnalytics(place.placeId, "searches").catch(() => undefined);
    });

    const minRating = params.minRating ?? 0;
    const filtered = data.filter((place) => place.rating >= minRating);
    const sorted = [...filtered].sort((a, b) => {
      if (params.sort === "rating") return b.rating - a.rating;
      if (params.sort === "trending") return b.trendingScore - a.trendingScore;
      return a.distanceMeters - b.distanceMeters;
    });

    return { origin, results: sorted.slice(offset, offset + limit), nextOffset: offset + limit < sorted.length ? offset + limit : null };
  },

  async autocomplete(input: string, lat?: number, lng?: number) {
    const q = sanitize(input);
    if (q.length < 2) return [];
    const params = new URLSearchParams({ q, format: "json", addressdetails: "1", limit: "8" });
    if (lat && lng) {
      params.set("viewbox", `${lng - 0.5},${lat + 0.5},${lng + 0.5},${lat - 0.5}`);
      params.set("bounded", "0");
    }
    const key = `suggest:${params.toString()}`;
    const cached = getCached<unknown[]>(key);
    if (cached) return cached;
    const response = await fetch(`${nominatimUrl}/search?${params}`, { headers });
    const data = (await response.json()) as Array<{ osm_type: string; osm_id: number; display_name: string; lat: string; lon: string; type?: string }>;
    return setCached(
      key,
      data.map((item) => ({
        placeId: `${item.osm_type}-${item.osm_id}`,
        description: item.display_name,
        mainText: item.display_name.split(",")[0],
        secondaryText: item.display_name.split(",").slice(1, 3).join(",").trim(),
        location: { lat: Number(item.lat), lng: Number(item.lon) },
        category: item.type ?? "place"
      })),
      1000 * 60 * 10
    );
  },

  async route(from: { lat: number; lng: number }, to: { lat: number; lng: number }) {
    const response = await fetch(`${osrmUrl}/${from.lng},${from.lat};${to.lng},${to.lat}?overview=full&geometries=geojson&steps=true`, { headers });
    if (!response.ok) throw new AppError(StatusCodes.BAD_GATEWAY, "Route service is temporarily unavailable");
    const data = (await response.json()) as { routes?: Array<{ distance: number; duration: number; geometry: { coordinates: [number, number][] } }> };
    const route = data.routes?.[0];
    if (!route) throw new AppError(StatusCodes.NOT_FOUND, "No route found");
    return {
      distanceMeters: Math.round(route.distance),
      durationSeconds: Math.round(route.duration),
      coordinates: route.geometry.coordinates.map(([lng, lat]) => [lat, lng])
    };
  },

  async trending() {
    const collection = await analyticsCollection().catch(() => undefined);
    if (collection) {
      const rows = await collection
        .find({})
        .sort({ views: -1, searches: -1, lastSearchedAt: -1 })
        .limit(12)
        .toArray();
      return rows.map((row) => ({ placeId: row.placeId, views: row.views ?? 0, searches: row.searches ?? 0, lastSearchedAt: row.lastSearchedAt, score: (row.views ?? 0) * 2 + (row.searches ?? 0) }));
    }

    return [...analytics.entries()]
      .map(([placeId, item]) => ({ placeId, ...item, score: item.views * 2 + item.searches }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 12);
  },

  async trackView(placeId: string) {
    await incrementAnalytics(placeId, "views");
    return analytics.get(placeId);
  }
};
