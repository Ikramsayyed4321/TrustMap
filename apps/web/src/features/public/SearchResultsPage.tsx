import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { Clock, LocateFixed, MapPin, Navigation, Search, SlidersHorizontal, Star } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { LeafletPlacesMap } from "../../components/maps/LeafletPlacesMap";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { api } from "../../lib/api";

export type PlaceResult = {
  placeId: string;
  osmType: string;
  osmId: number;
  name: string;
  rating: number;
  reviewCount: number;
  address: string;
  distanceMeters: number;
  distanceText: string;
  category: string;
  openNow: boolean | null;
  openingHours: string | null;
  phone: string | null;
  website: string | null;
  photoUrl: string | null;
  description: string;
  location: { lat: number; lng: number };
  trendingScore: number;
};

type Suggestion = {
  placeId: string;
  mainText: string;
  secondaryText: string;
  description: string;
  location?: { lat: number; lng: number };
};

const categoryTabs = [
  ["Restaurants", "restaurant"],
  ["Hospitals", "hospital"],
  ["Schools", "school"],
  ["Cafes", "cafe"],
  ["Hotels", "hotel"],
  ["Gyms", "gym"],
  ["Shopping", "shopping"],
  ["Medical Stores", "medical stores"],
  ["Salons", "salon"],
  ["Parks", "park"]
];

const storedPlacesKey = "reviewhub_osm_places";

export function SearchResultsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const searchBoxRef = useRef<HTMLDivElement | null>(null);
  const [query, setQuery] = useState(searchParams.get("q") ?? searchParams.get("category") ?? "restaurant");
  const [city, setCity] = useState("");
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number }>();
  const [locationDenied, setLocationDenied] = useState(false);
  const [places, setPlaces] = useState<PlaceResult[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [selectedPlaceId, setSelectedPlaceId] = useState<string>();
  const [nextOffset, setNextOffset] = useState<number | null>(null);
  const [route, setRoute] = useState<[number, number][]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [notice, setNotice] = useState("");
  const [minRating, setMinRating] = useState("0");
  const [distance, setDistance] = useState("5000");
  const [openNow, setOpenNow] = useState(false);
  const [category, setCategory] = useState(searchParams.get("category") ?? searchParams.get("q") ?? "restaurant");
  const [sort, setSort] = useState("nearest");
  const requestId = useRef(0);
  const suppressAutocomplete = useRef(false);

  const canSearch = query.trim().length >= 2 && (userLocation || city.trim());
  const selectedPlace = useMemo(() => places.find((place) => place.placeId === selectedPlaceId), [places, selectedPlaceId]);

  useEffect(() => {
    requestLocation();
  }, []);

  useEffect(() => {
    const nextQuery = searchParams.get("q");
    const nextCategory = searchParams.get("category");
    if (nextQuery !== null && nextQuery !== query) setQuery(nextQuery);
    if (nextCategory !== null && nextCategory !== category) setCategory(nextCategory);
  }, [searchParams]);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      if ((searchParams.get("q") ?? "") === query.trim()) return;
      const next = new URLSearchParams(searchParams);
      if (query.trim()) next.set("q", query.trim());
      else next.delete("q");
      setSearchParams(next, { replace: true });
    }, 350);
    return () => window.clearTimeout(handle);
  }, [query, searchParams, setSearchParams]);

  useEffect(() => {
    if (query.trim().length < 2) {
      setSuggestions([]);
      setSuggestionsOpen(false);
      return;
    }

    const handle = window.setTimeout(async () => {
      if (suppressAutocomplete.current) {
        suppressAutocomplete.current = false;
        setSuggestions([]);
        setSuggestionsOpen(false);
        return;
      }

      try {
        const { data } = await api.get<Suggestion[]>("/search/osm/autocomplete", {
          params: { input: query, lat: userLocation?.lat, lng: userLocation?.lng }
        });
        setSuggestions(data);
        setSuggestionsOpen(data.length > 0);
      } catch {
        setSuggestions([]);
        setSuggestionsOpen(false);
      }
    }, 250);

    return () => window.clearTimeout(handle);
  }, [query, userLocation]);

  useEffect(() => {
    if (!canSearch) return;
    const handle = window.setTimeout(() => searchPlaces(false), 450);
    return () => window.clearTimeout(handle);
  }, [query, userLocation, city, minRating, distance, openNow, category, sort]);

  useEffect(() => {
    if (places.length) localStorage.setItem(storedPlacesKey, JSON.stringify(places.slice(0, 80)));
  }, [places]);

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (!searchBoxRef.current?.contains(event.target as Node)) setSuggestionsOpen(false);
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setSuggestionsOpen(false);
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  function requestLocation() {
    if (!navigator.geolocation) {
      setLocationDenied(true);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
        setLocationDenied(false);
      },
      () => setLocationDenied(true),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    );
  }

  async function searchPlaces(append: boolean) {
    const currentRequest = ++requestId.current;
    setNotice("");
    setSuggestionsOpen(false);
    setSuggestions([]);
    append ? setLoadingMore(true) : setLoading(true);

    try {
      const { data } = await api.get<{ results: PlaceResult[]; nextOffset: number | null }>("/search/osm/nearby", {
        params: {
          keyword: query,
          lat: userLocation?.lat,
          lng: userLocation?.lng,
          city: userLocation ? undefined : city,
          radius: distance,
          minRating,
          openNow,
          category,
          sort,
          offset: append ? nextOffset : 0,
          limit: 20
        }
      });

      if (currentRequest !== requestId.current) return;
      setPlaces((current) => (append ? [...current, ...data.results] : data.results));
      setNextOffset(data.nextOffset);
      setSelectedPlaceId(data.results[0]?.placeId);
      if (!append) setRoute([]);
    } catch {
      setNotice("OpenStreetMap search is temporarily unavailable. Try again in a moment or reduce the radius.");
      if (!append) setPlaces([]);
      setNextOffset(null);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }

  async function loadRoute(place: PlaceResult) {
    if (!userLocation) {
      setNotice("Allow location access to calculate directions from your current position.");
      return;
    }
    const { data } = await api.get<{ coordinates: [number, number][] }>("/search/osm/route", {
      params: { fromLat: userLocation.lat, fromLng: userLocation.lng, toLat: place.location.lat, toLng: place.location.lng }
    });
    setRoute(data.coordinates);
    setSelectedPlaceId(place.placeId);
  }

  function submitFallbackCity(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (query.trim() && city.trim()) searchPlaces(false);
  }

  function chooseCategory(nextCategory: string) {
    suppressAutocomplete.current = true;
    setSuggestions([]);
    setSuggestionsOpen(false);
    setCategory(nextCategory);
    setQuery(nextCategory);
  }

  function openPlace(place: PlaceResult) {
    api.post(`/search/osm/places/${encodeURIComponent(place.placeId)}/view`).catch(() => undefined);
    localStorage.setItem(`reviewhub_place_${place.placeId}`, JSON.stringify(place));
    navigate(`/place/${encodeURIComponent(place.placeId)}`);
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-4">
      <div className="sticky top-[65px] z-30 -mx-4 border-b border-border bg-background/95 px-4 py-3 backdrop-blur">
        <div ref={searchBoxRef} className="relative mx-auto max-w-3xl">
          <div className="flex items-center rounded-md border border-border bg-card px-3 py-2 shadow-sm">
            <Search className="h-4 w-4 text-slate-500" />
            <input
              className="ml-2 w-full bg-transparent text-sm outline-none"
              placeholder="Search restaurants, cafes, hospitals, gyms"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setSuggestionsOpen(true);
              }}
              onFocus={() => suggestions.length > 0 && setSuggestionsOpen(true)}
            />
            <Button type="button" variant="secondary" onClick={requestLocation}>
              <LocateFixed className="h-4 w-4" /> Use My Location
            </Button>
          </div>
          {suggestionsOpen && suggestions.length > 0 ? (
            <div className="absolute left-0 right-0 top-12 z-40 rounded-md border border-border bg-card p-2 shadow-lg">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion.placeId}
                  type="button"
                  className="w-full rounded-md px-3 py-2 text-left text-sm hover:bg-muted"
                  onClick={() => {
                    suppressAutocomplete.current = true;
                    setQuery(suggestion.mainText);
                    setCity(suggestion.description);
                    setSuggestions([]);
                    setSuggestionsOpen(false);
                  }}
                >
                  <span className="block font-semibold">{suggestion.mainText}</span>
                  <span className="block truncate text-xs text-slate-500">{suggestion.secondaryText}</span>
                </button>
              ))}
            </div>
          ) : null}
        </div>
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {categoryTabs.map(([label, value]) => (
            <button
              key={value}
              type="button"
              className={`shrink-0 rounded-md border px-3 py-2 text-sm ${category === value ? "border-primary bg-primary text-white" : "border-border bg-card hover:bg-muted"}`}
              onClick={() => chooseCategory(value)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {locationDenied ? (
        <form className="mt-4 flex gap-2 rounded-lg border border-border bg-card p-3" onSubmit={submitFallbackCity}>
          <input
            className="min-w-0 flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm"
            placeholder="Location denied. Enter city or area"
            value={city}
            onChange={(event) => setCity(event.target.value)}
          />
          <Button type="submit">Search</Button>
        </form>
      ) : null}

      <div className="mt-4 grid gap-6 lg:grid-cols-[380px_1fr]">
        <aside className="space-y-4 lg:max-h-[calc(100vh-150px)] lg:overflow-y-auto lg:pr-1">
          <Card className="p-4">
            <div className="mb-4 flex items-center gap-2 font-semibold">
              <SlidersHorizontal className="h-4 w-4" /> Filters
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <select className="rounded-md border border-border bg-background px-3 py-2 text-sm" value={distance} onChange={(event) => setDistance(event.target.value)}>
                <option value="1000">Within 1 km</option>
                <option value="5000">Within 5 km</option>
                <option value="10000">Within 10 km</option>
                <option value="25000">Within 25 km</option>
              </select>
              <select className="rounded-md border border-border bg-background px-3 py-2 text-sm" value={minRating} onChange={(event) => setMinRating(event.target.value)}>
                <option value="0">Any rating</option>
                <option value="4">4.0+</option>
                <option value="4.5">4.5+</option>
              </select>
              <select className="rounded-md border border-border bg-background px-3 py-2 text-sm" value={sort} onChange={(event) => setSort(event.target.value)}>
                <option value="nearest">Nearest</option>
                <option value="rating">Top Rated</option>
                <option value="trending">Trending</option>
              </select>
              <label className="flex items-center justify-between rounded-md border border-border px-3 py-2 text-sm">
                Open now
                <input type="checkbox" className="h-4 w-4 accent-primary" checked={openNow} onChange={(event) => setOpenNow(event.target.checked)} />
              </label>
            </div>
          </Card>

          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold">Nearby Places</h1>
            <span className="text-sm text-slate-500">{places.length} shown</span>
          </div>

          {loading ? <ResultsSkeleton /> : null}
          {notice ? <Card className="border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:bg-amber-950/30 dark:text-amber-200">{notice}</Card> : null}
          {!loading && canSearch && places.length === 0 ? <Card className="p-6 text-center text-sm text-slate-500">No OSM places found nearby.</Card> : null}

          <div className="grid gap-3">
            {places.map((place) => (
              <PlaceCard key={place.placeId} place={place} active={place.placeId === selectedPlaceId} onSelect={() => setSelectedPlaceId(place.placeId)} onOpen={() => openPlace(place)} onRoute={() => loadRoute(place)} />
            ))}
          </div>

          {nextOffset !== null ? (
            <Button className="w-full" variant="secondary" disabled={loadingMore} onClick={() => searchPlaces(true)}>
              {loadingMore ? "Loading..." : "Load more places"}
            </Button>
          ) : null}
        </aside>

        <section className="lg:sticky lg:top-[150px] lg:h-fit">
          <LeafletPlacesMap places={places} userLocation={userLocation} selectedPlaceId={selectedPlace?.placeId} route={route} onSelect={setSelectedPlaceId} />
        </section>
      </div>
    </div>
  );
}

function PlaceCard({ place, active, onSelect, onOpen, onRoute }: { place: PlaceResult; active: boolean; onSelect: () => void; onOpen: () => void; onRoute: () => void }) {
  return (
    <Card className={`overflow-hidden transition hover:border-primary ${active ? "border-primary" : ""}`}>
      <button type="button" className="block w-full p-4 text-left" onClick={onSelect}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="font-semibold">{place.name}</h2>
            <p className="mt-1 text-xs uppercase tracking-wide text-primary">{place.category}</p>
          </div>
          <span className="flex shrink-0 items-center gap-1 text-sm font-semibold">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            {place.rating}
          </span>
        </div>
        <p className="mt-2 flex gap-2 text-sm text-slate-500">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
          {place.address}
        </p>
        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          <span className="rounded-md bg-muted px-2 py-1">{place.distanceText}</span>
          <span className="rounded-md bg-muted px-2 py-1">{place.reviewCount} reviews</span>
          <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-slate-500">
            <Clock className="h-3 w-3" />
            {place.openingHours ? place.openingHours : "Hours not listed"}
          </span>
        </div>
      </button>
      <div className="flex gap-2 border-t border-border p-3">
        <Button className="flex-1" variant="secondary" onClick={onRoute}>
          <Navigation className="h-4 w-4" /> Route
        </Button>
        <Button className="flex-1" onClick={onOpen}>
          Details
        </Button>
      </div>
    </Card>
  );
}

function ResultsSkeleton() {
  return (
    <div className="grid gap-3">
      {[1, 2, 3].map((item) => (
        <Card key={item} className="p-4">
          <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
          <div className="mt-3 h-3 w-full animate-pulse rounded bg-muted" />
          <div className="mt-2 h-3 w-1/2 animate-pulse rounded bg-muted" />
        </Card>
      ))}
    </div>
  );
}


