import { Camera, Heart, MessageSquare, Share2, Star } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { demoBusinesses } from "../../data/demo";

export function BusinessDetailsPage() {
  const business = demoBusinesses[0];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <section className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div>
          <div className="h-72 rounded-lg bg-[linear-gradient(135deg,#0f766e,#f59e0b)]" />
          <div className="mt-6 flex flex-col justify-between gap-4 md:flex-row">
            <div>
              <p className="text-sm text-primary">{business.category}</p>
              <h1 className="text-4xl font-bold">{business.name}</h1>
              <div className="mt-2 flex items-center gap-2 text-sm">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                {business.rating} · {business.reviews} reviews · {business.city}
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
            <h2 className="text-lg font-semibold">AI Review Summary</h2>
            <p className="mt-2 text-slate-600 dark:text-slate-300">{business.summary}</p>
          </Card>
          <Card className="mt-6 p-5">
            <h2 className="text-lg font-semibold">Reviews</h2>
            {[5, 4, 3].map((rating) => (
              <div key={rating} className="border-b border-border py-4 last:border-0">
                <div className="flex items-center justify-between">
                  <strong>Verified reviewer</strong>
                  <span>{rating} stars</span>
                </div>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                  Helpful staff, clean environment, and a visit worth repeating. The AI moderation status is low risk.
                </p>
              </div>
            ))}
          </Card>
        </div>
        <aside className="h-fit rounded-lg border border-border bg-card p-5">
          <Button className="w-full">
            <MessageSquare className="h-4 w-4" /> Write a Review
          </Button>
          <Button className="mt-3 w-full" variant="secondary">
            <Camera className="h-4 w-4" /> Add Photos
          </Button>
          <div className="mt-5 space-y-3 text-sm">
            <p>
              <strong>Address:</strong> Airport Road, {business.city}
            </p>
            <p>
              <strong>Hours:</strong> Open until 11:00 PM
            </p>
            <p>
              <strong>Amenities:</strong> Family seating, parking, Wi-Fi
            </p>
          </div>
        </aside>
      </section>
    </div>
  );
}
