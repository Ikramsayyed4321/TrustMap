import { ArrowRight, Facebook, Instagram, Linkedin, Mail, MapPin, Phone, Twitter } from "lucide-react";
import { Link } from "react-router-dom";

const footerColumns = [
  {
    title: "Explore",
    links: [
      ["Nearby Search", "/search"],
      ["Categories", "/categories"],
      ["Trending", "/trending"],
      ["Blog", "/blog"]
    ]
  },
  {
    title: "Company",
    links: [
      ["About", "/about"],
      ["Contact", "/contact"],
      ["Reviewers", "/reviewers"],
      ["Login", "/login"]
    ]
  },
  {
    title: "Popular",
    links: [
      ["Restaurants", "/search?q=restaurant&category=restaurant&strict=true"],
      ["Hospitals", "/search?q=hospital&category=hospital&strict=true"],
      ["Cafes", "/search?q=cafe&category=cafe&strict=true"],
      ["Gyms", "/search?q=gym&category=gym&strict=true"]
    ]
  }
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid gap-10 lg:grid-cols-[1.25fr_2fr_1.1fr]">
          <div>
            <Link to="/" className="text-2xl font-bold">
              ReviewHub
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-6 text-slate-600 dark:text-slate-300">
              Discover nearby restaurants, cafes, hospitals, gyms, schools, shops, and local businesses with OpenStreetMap-powered search, reviews, and directions.
            </p>
            <div className="mt-5 flex gap-2">
              {[Facebook, Twitter, Instagram, Linkedin].map((Icon, index) => (
                <button key={index} type="button" className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border hover:bg-muted" aria-label="Social link">
                  <Icon className="h-4 w-4" />
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-8 sm:grid-cols-3">
            {footerColumns.map((column) => (
              <div key={column.title}>
                <h2 className="font-semibold">{column.title}</h2>
                <div className="mt-4 grid gap-3">
                  {column.links.map(([label, href]) => (
                    <Link key={href} to={href} className="text-sm text-slate-600 hover:text-primary dark:text-slate-300">
                      {label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-lg border border-border bg-background p-5">
            <h2 className="font-semibold">Stay Updated</h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Get local discovery tips and review updates.</p>
            <form className="mt-4 flex gap-2" onSubmit={(event) => event.preventDefault()}>
              <input className="min-w-0 flex-1 rounded-md border border-border bg-card px-3 py-2 text-sm outline-none" placeholder="Email address" type="email" />
              <button className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-primary text-white" type="submit" aria-label="Subscribe">
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
            <div className="mt-5 grid gap-3 text-sm text-slate-600 dark:text-slate-300">
              <span className="inline-flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary" /> support@reviewhub.local
              </span>
              <span className="inline-flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary" /> +91 98765 43210
              </span>
              <span className="inline-flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" /> India
              </span>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-border pt-6 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
          <p>Copyright 2026 ReviewHub. All rights reserved.</p>
          <div className="flex flex-wrap gap-4">
            <Link to="/about" className="hover:text-primary">
              Privacy Policy
            </Link>
            <Link to="/contact" className="hover:text-primary">
              Terms
            </Link>
            <Link to="/contact" className="hover:text-primary">
              Support
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
