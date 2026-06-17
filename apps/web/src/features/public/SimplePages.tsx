import { Link } from "react-router-dom";
import { Card } from "../../components/ui/Card";
import { demoBusinesses } from "../../data/demo";

export function CategoriesPage() {
  const categories = [
    ["Restaurants", "restaurant"],
    ["Hotels", "hotel"],
    ["Shops", "shopping"],
    ["Cafes", "cafe"],
    ["Hospitals", "hospital"],
    ["Schools", "school"],
    ["Gyms", "gym"],
    ["Medical Stores", "medical stores"],
    ["Salons", "salon"],
    ["Parks", "park"],
    ["Local Businesses", "local business"]
  ];
  return <SearchLinkGridPage title="Categories" items={categories} />;
}

export function TrendingPage() {
  const trending = [
    ["Restaurants Near You", "restaurant"],
    ["Cafes Near You", "cafe"],
    ["Hotels Near You", "hotel"],
    ["Hospitals Near You", "hospital"],
    ["Gyms Near You", "gym"],
    ["Shopping Near You", "shopping"],
    ["Schools Near You", "school"],
    ["Parks Near You", "park"]
  ];
  return <SearchLinkGridPage title="Trending Nearby" items={trending} />;
}

export function BlogPage() {
  const history = JSON.parse(localStorage.getItem("reviewhub_search_history") ?? "[]") as string[];
  const tips = [
    "Use category words like restaurant, school, hospital, cafe, gym, hotel, salon, or park.",
    "Allow location access so ReviewHub can find places near your current position.",
    "Use the distance filter to switch between 1 km, 5 km, 10 km, and 25 km.",
    "Click any place card to open details, write reviews, and view directions.",
    "If location permission is denied, enter your city or area manually."
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-3xl font-bold">Blog</h1>
      <p className="mt-3 text-slate-600 dark:text-slate-300">
        Learn how to search nearby places, use categories, review businesses, and find directions with OpenStreetMap-powered discovery.
      </p>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
        <Card className="p-6">
          <h2 className="text-xl font-semibold">How to Search on ReviewHub</h2>
          <div className="mt-4 grid gap-3">
            {tips.map((tip) => (
              <p key={tip} className="rounded-md border border-border p-3 text-sm text-slate-600 dark:text-slate-300">
                {tip}
              </p>
            ))}
          </div>
          <Link className="mt-5 inline-flex rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white" to="/search">
            Start Searching
          </Link>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold">Search History</h2>
          {history.length ? (
            <div className="mt-4 grid gap-2">
              {history.map((item) => (
                <Link key={item} className="rounded-md border border-border px-3 py-2 text-sm hover:bg-muted" to={`/search?q=${encodeURIComponent(item)}`}>
                  {item}
                </Link>
              ))}
            </div>
          ) : (
            <p className="mt-4 text-sm text-slate-500">Your recent searches will appear here.</p>
          )}
        </Card>
      </div>
    </div>
  );
}
export function ReviewerProfilesPage() {
  const reviewers = [
    {
      name: "Aarav Mehta",
      role: "Restaurant and cafe reviewer",
      reviews: 128,
      focus: "Food quality, service speed, hygiene, and family-friendly seating.",
      location: "New Delhi"
    },
    {
      name: "Sara Thomas",
      role: "Hotel and travel reviewer",
      reviews: 94,
      focus: "Room cleanliness, staff behavior, breakfast, check-in experience, and value for money.",
      location: "Mumbai"
    },
    {
      name: "Neha Kapoor",
      role: "Health, gym, and wellness reviewer",
      reviews: 76,
      focus: "Equipment quality, trainer support, appointment handling, and safety standards.",
      location: "Bengaluru"
    },
    {
      name: "Imran Shah",
      role: "Local business reviewer",
      reviews: 112,
      focus: "Shops, salons, pharmacies, schools, parks, and neighborhood services.",
      location: "Hyderabad"
    }
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="text-3xl font-bold">Reviewer Profiles</h1>
      <p className="mt-3 max-w-3xl text-slate-600 dark:text-slate-300">
        ReviewHub highlights reviewers who write useful, specific, and community-focused reviews. Profiles help visitors understand each reviewer&apos;s focus area, review history, and local expertise before trusting a recommendation.
      </p>
      <div className="mt-8 grid gap-5 md:grid-cols-2">
        {reviewers.map((reviewer) => (
          <Card key={reviewer.name} className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold">{reviewer.name}</h2>
                <p className="mt-1 text-sm text-primary">{reviewer.role}</p>
              </div>
              <span className="rounded-md bg-muted px-3 py-1 text-sm font-semibold">{reviewer.reviews} reviews</span>
            </div>
            <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">{reviewer.focus}</p>
            <p className="mt-3 text-sm text-slate-500">Based in {reviewer.location}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function AboutPage() {
  const points = [
    ["Independent local discovery", "ReviewHub helps users discover nearby places without depending on paid listings or external review providers. Search is powered by OpenStreetMap, Overpass, Nominatim, and OSRM routing."],
    ["Useful reviews", "The platform focuses on practical review details: cleanliness, service, price, distance, opening hours, safety, accessibility, and real visit experience."],
    ["Map-first experience", "Users can search by category, use live location, view nearby results on a Leaflet map, open place details, write reviews, and request directions."],
    ["Community trust", "Reviewer profiles, local review history, saved places, and trending analytics are designed to make recommendations easier to understand and compare."]
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="text-3xl font-bold">About ReviewHub</h1>
      <p className="mt-4 max-w-4xl text-lg text-slate-600 dark:text-slate-300">
        ReviewHub is a local discovery and review platform for restaurants, cafes, hotels, hospitals, schools, gyms, shops, salons, parks, medical stores, and neighborhood businesses. It combines nearby search, maps, community reviews, and directions into one clean experience.
      </p>
      <div className="mt-8 grid gap-5 md:grid-cols-2">
        {points.map(([title, text]) => (
          <Card key={title} className="p-6">
            <h2 className="text-xl font-semibold">{title}</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{text}</p>
          </Card>
        ))}
      </div>
      <Card className="mt-6 p-6">
        <h2 className="text-xl font-semibold">How it works</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-4">
          {["Search a place or category", "Allow location or enter a city", "Compare nearby results", "Open details, directions, and reviews"].map((step, index) => (
            <div key={step} className="rounded-md border border-border p-4 text-sm">
              <span className="text-lg font-bold text-primary">0{index + 1}</span>
              <p className="mt-2 font-semibold">{step}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

export function ContactPage() {
  const contacts = [
    ["General support", "support@reviewhub.local", "Questions about search, reviews, saved places, or account access."],
    ["Business verification", "owners@reviewhub.local", "Requests to update business details, contact information, hours, and ownership status."],
    ["Moderation", "trust@reviewhub.local", "Report spam, abusive content, incorrect place data, or suspicious review activity."],
    ["Partnerships", "partners@reviewhub.local", "Local discovery partnerships, city guides, and community programs."]
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="text-3xl font-bold">Contact ReviewHub</h1>
      <p className="mt-3 max-w-3xl text-slate-600 dark:text-slate-300">
        Reach the ReviewHub team for support, moderation, business-owner verification, partnerships, and local data corrections. We aim to keep place information useful, respectful, and community driven.
      </p>
      <div className="mt-8 grid gap-5 md:grid-cols-2">
        {contacts.map(([title, email, text]) => (
          <Card key={title} className="p-6">
            <h2 className="text-xl font-semibold">{title}</h2>
            <a className="mt-2 block text-sm font-semibold text-primary" href={`mailto:${email}`}>
              {email}
            </a>
            <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{text}</p>
          </Card>
        ))}
      </div>
      <Card className="mt-6 p-6">
        <h2 className="text-xl font-semibold">Before contacting us</h2>
        <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
          Include the place name, city, category, and a short explanation of the issue. For review reports, include why the review may violate community standards. For business updates, include official contact details or a public source where possible.
        </p>
      </Card>
    </div>
  );
}

function SearchLinkGridPage({ title, items }: { title: string; items: string[][] }) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="mb-6 text-3xl font-bold">{title}</h1>
      <div className="grid gap-4 md:grid-cols-4">
        {items.map(([label, value]) => (
          <Link key={value} to={`/search?q=${encodeURIComponent(value)}&category=${encodeURIComponent(value)}&strict=true`}>
            <Card className="p-5 font-semibold transition hover:border-primary hover:bg-muted">
              {label}
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

function GridPage({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="mb-6 text-3xl font-bold">{title}</h1>
      <div className="grid gap-4 md:grid-cols-4">
        {items.map((item) => (
          <Card key={item} className="p-5 font-semibold">
            {item}
          </Card>
        ))}
      </div>
    </div>
  );
}

function TextPage({ title, text }: { title: string; text: string }) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14">
      <h1 className="text-3xl font-bold">{title}</h1>
      <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">{text}</p>
    </div>
  );
}








