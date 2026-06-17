import { motion } from "framer-motion";
import { ArrowRight, BarChart3, MapPin, Radar, ShieldCheck, Sparkles, Star, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { demoBusinesses } from "../../data/demo";
import { BusinessMap } from "../../components/maps/BusinessMap";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";

const metrics = [
  ["12.9K", "mapped businesses"],
  ["188K", "community reviews"],
  ["4.8", "avg trust score"]
];

const categories = ["Restaurants", "Hospitals", "Cafes", "Gyms", "Hotels", "Schools"];

export function HomePage() {
  return (
    <div className="overflow-hidden">
      <section className="relative border-b border-border">
        <div className="premium-grid absolute inset-0 opacity-70" />
        <div className="relative mx-auto grid min-h-[680px] max-w-7xl items-center gap-10 px-4 py-14 lg:grid-cols-[1fr_540px]">
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-card/80 px-3 py-1 text-sm shadow-sm backdrop-blur">
              <Sparkles className="h-4 w-4 text-primary" />
              Premium local intelligence powered by open maps
            </div>
            <h1 className="max-w-4xl text-5xl font-bold leading-tight md:text-7xl">
              Discover nearby places with reviews you can actually trust.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300">
              Search restaurants, cafes, hospitals, schools, gyms, hotels, shops, and services with map-first discovery, reviewer profiles, smart categories, and route directions.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/search">
                <Button className="h-12 px-5">
                  Start searching <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/categories">
                <Button className="h-12 px-5" variant="secondary">
                  Browse categories
                </Button>
              </Link>
            </div>
            <div className="mt-8 grid max-w-xl grid-cols-3 gap-3">
              {metrics.map(([value, label]) => (
                <Card key={label} className="p-4">
                  <p className="text-2xl font-bold">{value}</p>
                  <p className="mt-1 text-xs text-slate-500">{label}</p>
                </Card>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.1 }} className="space-y-4">
            <div className="glass rounded-lg p-3">
              <BusinessMap businesses={demoBusinesses} />
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {categories.map((category) => (
                <Link key={category} to={`/search?q=${encodeURIComponent(category.toLowerCase())}&category=${encodeURIComponent(category.toLowerCase())}`}>
                  <Card className="p-3 text-center text-sm font-semibold">{category}</Card>
                </Link>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-primary">Live discovery</p>
            <h2 className="mt-2 text-3xl font-bold">Trending Places</h2>
          </div>
          <Link className="text-sm font-semibold text-primary" to="/trending">
            View all
          </Link>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {demoBusinesses.map((business, index) => (
            <motion.div key={business.id} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.08 }}>
              <Card className="h-full p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm text-slate-500">{business.category}</p>
                    <h3 className="mt-1 text-lg font-semibold">{business.name}</h3>
                  </div>
                  {business.verified && <ShieldCheck className="h-5 w-5 text-primary" />}
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{business.summary}</p>
                <div className="mt-5 flex items-center justify-between text-sm">
                  <span className="inline-flex items-center gap-1 font-semibold">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" /> {business.rating} ({business.reviews})
                  </span>
                  <span className="inline-flex items-center gap-1 text-slate-500">
                    <MapPin className="h-4 w-4" /> {business.city}
                  </span>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16">
        <div className="grid gap-5 md:grid-cols-3">
          {[
            [Radar, "Nearby precision", "Location-aware search with configurable distance and category filters."],
            [BarChart3, "Review intelligence", "Visual trust signals, reviewer history, and practical local insights."],
            [TrendingUp, "Trending analytics", "Discover what people are searching and reviewing around you."]
          ].map(([Icon, title, text]) => (
            <Card key={String(title)} className="p-6">
              <Icon className="h-5 w-5 text-primary" />
              <h3 className="mt-4 text-lg font-semibold">{String(title)}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{String(text)}</p>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
