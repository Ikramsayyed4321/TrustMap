import { FormEvent, useEffect, useState } from "react";
import { Camera, Globe, Heart, MapPin, MessageSquare, Navigation, Phone, Share2, Star } from "lucide-react";
import { useParams } from "react-router-dom";
import { LeafletPlacesMap } from "../../components/maps/LeafletPlacesMap";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { api } from "../../lib/api";
import { useAppStore } from "../../store/app.store";
import type { PlaceResult } from "./SearchResultsPage";

type LocalReview = {
  id: string;
  placeId: string;
  placeName: string;
  placeCategory: string;
  placeAddress: string;
  rating: number;
  text: string;
  createdAt: string;
  userId?: string;
  userName?: string;
};

export function PlaceDetailsPage() {
  const { id = "" } = useParams();
  const [place, setPlace] = useState<PlaceResult>();
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number }>();
  const [route, setRoute] = useState<[number, number][]>([]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [reviews, setReviews] = useState<LocalReview[]>([]);
  const user = useAppStore((state) => state.user);

  useEffect(() => {
    const stored = localStorage.getItem(`reviewhub_place_${id}`);
    if (stored) setPlace(JSON.parse(stored));
    const storedReviews = localStorage.getItem(`reviewhub_reviews_${id}`);
    if (storedReviews) setReviews(JSON.parse(storedReviews));
    api.post(`/search/osm/places/${encodeURIComponent(id)}/view`).catch(() => undefined);
  }, [id]);

  useEffect(() => {
    navigator.geolocation?.getCurrentPosition((position) => {
      setUserLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
    });
  }, []);

  async function loadRoute() {
    if (!place || !userLocation) return;
    const { data } = await api.get<{ coordinates: [number, number][] }>("/search/osm/route", {
      params: { fromLat: userLocation.lat, fromLng: userLocation.lng, toLat: place.location.lat, toLng: place.location.lng }
    });
    setRoute(data.coordinates);
  }

  function submitReview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = reviewText.trim();
    if (!text || !place) return;

    const review = {
      id: crypto.randomUUID(),
      placeId: id,
      placeName: place.name,
      placeCategory: place.category,
      placeAddress: place.address,
      rating: reviewRating,
      text,
      createdAt: new Date().toISOString(),
      userId: user?.id,
      userName: user?.name ?? "Guest reviewer"
    };
    const nextReviews = [review, ...reviews];
    const userReviews = JSON.parse(localStorage.getItem("reviewhub_user_reviews") ?? "[]") as LocalReview[];
    setReviews(nextReviews);
    localStorage.setItem(`reviewhub_reviews_${id}`, JSON.stringify(nextReviews));
    localStorage.setItem("reviewhub_user_reviews", JSON.stringify([review, ...userReviews]));
    setReviewText("");
    setReviewRating(5);
    setShowReviewForm(false);
  }

  if (!place) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12">
        <Card className="p-8 text-center">
          <h1 className="text-2xl font-bold">Place details unavailable</h1>
          <p className="mt-2 text-sm text-slate-500">Open a place from the nearby search results to view its full profile.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <section className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div>
          <div className="flex min-h-64 items-center justify-center rounded-lg bg-muted">
            {place.photoUrl ? <img src={place.photoUrl} alt={place.name} className="h-64 w-full rounded-lg object-cover" /> : <Camera className="h-12 w-12 text-slate-400" />}
          </div>
          <div className="mt-6 flex flex-col justify-between gap-4 md:flex-row">
            <div>
              <p className="text-sm uppercase tracking-wide text-primary">{place.category}</p>
              <h1 className="text-4xl font-bold">{place.name}</h1>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                {place.rating} · {place.reviewCount + reviews.length} reviews · {place.distanceText}
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary">
                <Heart className="h-4 w-4" /> Save
              </Button>
              <Button variant="secondary">
                <Share2 className="h-4 w-4" /> Share
              </Button>
            </div>
          </div>

          <Card className="mt-6 p-5">
            <h2 className="text-lg font-semibold">Description</h2>
            <p className="mt-2 text-slate-600 dark:text-slate-300">{place.description}</p>
          </Card>

          <Card className="mt-6 p-5">
            <h2 className="text-lg font-semibold">Reviews</h2>
            {showReviewForm ? (
              <form className="mt-4 grid gap-3 rounded-md border border-border p-4" onSubmit={submitReview}>
                <label className="grid gap-1 text-sm font-semibold">
                  Rating
                  <select className="rounded-md border border-border bg-background px-3 py-2 font-normal" value={reviewRating} onChange={(event) => setReviewRating(Number(event.target.value))}>
                    {[5, 4, 3, 2, 1].map((rating) => (
                      <option key={rating} value={rating}>
                        {rating} stars
                      </option>
                    ))}
                  </select>
                </label>
                <label className="grid gap-1 text-sm font-semibold">
                  Your review
                  <textarea
                    className="min-h-28 rounded-md border border-border bg-background px-3 py-2 font-normal"
                    placeholder="Share your experience..."
                    value={reviewText}
                    onChange={(event) => setReviewText(event.target.value)}
                  />
                </label>
                <div className="flex gap-2">
                  <Button type="submit">Post Review</Button>
                  <Button type="button" variant="secondary" onClick={() => setShowReviewForm(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            ) : null}
            {reviews.map((review) => (
              <div key={review.id} className="border-b border-border py-4 last:border-0">
                <div className="flex items-center justify-between">
                  <strong>{review.userName ?? "Your review"}</strong>
                  <span>{review.rating} stars</span>
                </div>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{review.text}</p>
              </div>
            ))}
            {[5, 4, 4].map((rating, index) => (
              <div key={`${rating}-${index}`} className="border-b border-border py-4 last:border-0">
                <div className="flex items-center justify-between">
                  <strong>Local reviewer</strong>
                  <span>{rating} stars</span>
                </div>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Useful local information from community discovery. Add real user reviews when MongoDB persistence is connected.</p>
              </div>
            ))}
          </Card>

          <Card className="mt-6 p-5">
            <h2 className="text-lg font-semibold">Nearby Recommendations</h2>
            <p className="mt-2 text-sm text-slate-500">Use the search page category tabs to discover similar places around this location.</p>
          </Card>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:h-fit">
          <LeafletPlacesMap places={[place]} userLocation={userLocation} selectedPlaceId={place.placeId} route={route} onSelect={() => undefined} />
          <Card className="p-5">
            <Button className="w-full" onClick={loadRoute}>
              <Navigation className="h-4 w-4" /> Show Directions
            </Button>
            <Button className="mt-3 w-full" variant="secondary" onClick={() => setShowReviewForm(true)}>
              <MessageSquare className="h-4 w-4" /> Write a Review
            </Button>
            <div className="mt-5 space-y-3 text-sm">
              <p className="flex gap-2">
                <MapPin className="h-4 w-4 shrink-0" /> {place.address}
              </p>
              {place.phone ? (
                <p className="flex gap-2">
                  <Phone className="h-4 w-4 shrink-0" /> {place.phone}
                </p>
              ) : null}
              {place.website ? (
                <a className="flex gap-2 text-primary" href={place.website} target="_blank" rel="noreferrer">
                  <Globe className="h-4 w-4 shrink-0" /> Website
                </a>
              ) : null}
              <p>
                <strong>Hours:</strong> {place.openingHours ?? "Not listed in OpenStreetMap"}
              </p>
            </div>
          </Card>
        </aside>
      </section>
    </div>
  );
}
