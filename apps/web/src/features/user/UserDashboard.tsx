import { Bell, Bookmark, KeyRound, Settings, Star, UserCircle } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { useAppStore } from "../../store/app.store";

const items: Array<[string, string, LucideIcon]> = [
  ["My Profile", "profile", UserCircle],
  ["My Reviews", "reviews", Star],
  ["Saved Places", "saved", Bookmark],
  ["Notifications", "notifications", Bell],
  ["Change Password", "password", KeyRound],
  ["Settings", "settings", Settings]
];

const sectionTitles: Record<string, string> = {
  profile: "My Profile",
  reviews: "My Reviews",
  saved: "Saved Places",
  notifications: "Notifications",
  password: "Change Password",
  settings: "Settings"
};

type StoredReview = {
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

function getStoredReviews() {
  const indexed = JSON.parse(localStorage.getItem("reviewhub_user_reviews") ?? "[]") as StoredReview[];
  const seen = new Set(indexed.map((review) => review.id));
  const migrated = [...indexed];

  for (let index = 0; index < localStorage.length; index += 1) {
    const key = localStorage.key(index);
    if (!key?.startsWith("reviewhub_reviews_")) continue;
    const placeId = key.replace("reviewhub_reviews_", "");
    const place = JSON.parse(localStorage.getItem(`reviewhub_place_${placeId}`) ?? "null") as
      | { name?: string; category?: string; address?: string }
      | null;
    const placeReviews = JSON.parse(localStorage.getItem(key) ?? "[]") as Partial<StoredReview>[];

    placeReviews.forEach((review) => {
      if (!review.id || seen.has(review.id)) return;
      seen.add(review.id);
      migrated.push({
        id: review.id,
        placeId,
        placeName: review.placeName ?? place?.name ?? "Saved place",
        placeCategory: review.placeCategory ?? place?.category ?? "local place",
        placeAddress: review.placeAddress ?? place?.address ?? "Address unavailable",
        rating: review.rating ?? 5,
        text: review.text ?? "",
        createdAt: review.createdAt ?? new Date().toISOString(),
        userId: review.userId,
        userName: review.userName
      });
    });
  }

  if (migrated.length !== indexed.length) localStorage.setItem("reviewhub_user_reviews", JSON.stringify(migrated));
  return migrated;
}

export function UserDashboard() {
  const user = useAppStore((state) => state.user);
  const { section = "profile" } = useParams();
  const title = sectionTitles[section] ?? "My Profile";

  return (
    <div className="mx-auto grid max-w-7xl gap-6 px-4 py-10 lg:grid-cols-[260px_1fr]">
      <aside className="h-fit rounded-lg border border-border bg-card p-3">
        <div className="border-b border-border px-3 py-3">
          <p className="truncate font-semibold">{user?.name}</p>
          <p className="truncate text-sm text-slate-500">{user?.email}</p>
        </div>
        <nav className="mt-3 grid gap-1">
          {items.map(([label, path, Icon]) => (
            <Link
              key={path}
              to={`/dashboard/${path}`}
              className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted ${
                section === path ? "bg-muted font-semibold" : ""
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </nav>
      </aside>

      <section>
        <h1 className="text-3xl font-bold">{title}</h1>
        <div className="mt-6">{renderSection(section, user)}</div>
      </section>
    </div>
  );
}

function renderSection(section: string, user: ReturnType<typeof useAppStore.getState>["user"]) {
  if (section === "reviews") {
    const allReviews = getStoredReviews();
    const reviews = user ? allReviews.filter((review) => !review.userId || review.userId === user.id) : allReviews;

    if (reviews.length === 0) {
      return (
        <Card className="p-8 text-center">
          <h2 className="text-lg font-semibold">No reviews yet</h2>
          <p className="mt-2 text-sm text-slate-500">Reviews you write on place pages will appear here.</p>
        </Card>
      );
    }

    return (
      <div className="grid gap-4">
        {reviews.map((review) => (
          <Card key={review.id} className="p-5">
            <div className="flex flex-col justify-between gap-3 md:flex-row">
              <div>
                <Link to={`/place/${encodeURIComponent(review.placeId)}`} className="text-lg font-semibold hover:text-primary">
                  {review.placeName}
                </Link>
                <p className="mt-1 text-sm text-slate-500">
                  {review.placeCategory} · {review.placeAddress}
                </p>
                <p className="mt-3 text-sm text-slate-700 dark:text-slate-300">{review.text}</p>
              </div>
              <div className="shrink-0 text-left md:text-right">
                <div className="inline-flex items-center gap-1 font-semibold">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  {review.rating}
                </div>
                <p className="mt-1 text-xs text-slate-500">{new Date(review.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (section === "profile") {
    return (
      <Card className="max-w-2xl p-6">
        <div className="grid gap-4">
          <label className="grid gap-2 text-sm font-semibold">
            Username
            <input className="rounded-md border border-border bg-background px-3 py-2 font-normal" value={user?.name ?? ""} readOnly />
          </label>
          <label className="grid gap-2 text-sm font-semibold">
            Email
            <input className="rounded-md border border-border bg-background px-3 py-2 font-normal" value={user?.email ?? ""} readOnly />
          </label>
          <label className="grid gap-2 text-sm font-semibold">
            Account type
            <input className="rounded-md border border-border bg-background px-3 py-2 font-normal capitalize" value={user?.role ?? ""} readOnly />
          </label>
          <Button className="w-fit">Save Profile</Button>
        </div>
      </Card>
    );
  }

  if (section === "password") {
    return (
      <Card className="max-w-2xl p-6">
        <div className="grid gap-4">
          <input className="rounded-md border border-border bg-background px-3 py-2" placeholder="Current password" type="password" />
          <input className="rounded-md border border-border bg-background px-3 py-2" placeholder="New password" type="password" />
          <input className="rounded-md border border-border bg-background px-3 py-2" placeholder="Confirm new password" type="password" />
          <Button className="w-fit">Change Password</Button>
        </div>
      </Card>
    );
  }

  if (section === "settings") {
    return (
      <Card className="max-w-2xl p-6">
        <div className="grid gap-4">
          <label className="flex items-center justify-between rounded-md border border-border px-3 py-2 text-sm">
            Email notifications
            <input type="checkbox" className="h-4 w-4 accent-primary" defaultChecked />
          </label>
          <label className="flex items-center justify-between rounded-md border border-border px-3 py-2 text-sm">
            Public reviewer profile
            <input type="checkbox" className="h-4 w-4 accent-primary" defaultChecked />
          </label>
          <label className="flex items-center justify-between rounded-md border border-border px-3 py-2 text-sm">
            Review reply alerts
            <input type="checkbox" className="h-4 w-4 accent-primary" defaultChecked />
          </label>
          <Button className="w-fit">Save Settings</Button>
        </div>
      </Card>
    );
  }

  const emptyText: Record<string, string> = {
    reviews: "Your written reviews will appear here.",
    saved: "Saved businesses and places will appear here.",
    notifications: "Account and review notifications will appear here."
  };

  return (
    <Card className="p-8 text-center">
      <h2 className="text-lg font-semibold">Nothing here yet</h2>
      <p className="mt-2 text-sm text-slate-500">{emptyText[section] ?? "Choose a menu item to manage your account."}</p>
    </Card>
  );
}
