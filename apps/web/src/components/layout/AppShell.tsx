import { FormEvent, useEffect, useRef, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Bell, Bookmark, ChevronDown, Code2, HelpCircle, History, KeyRound, Languages, Lightbulb, LogOut, MapPinned, Menu, Moon, Search, Settings, Share2, Star, Sun, UserCircle, X } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { Button } from "../ui/Button";
import { Footer } from "./Footer";
import { useAppStore } from "../../store/app.store";

const labels = {
  en: {
    menu: "Menu",
    tools: "Tools and quick actions",
    language: "Language",
    tips: "Tips and tricks",
    help: "Get help",
    shareLocation: "Share my location",
    sharePage: "Share this page",
    embed: "Share or embed",
    history: "History",
    noHistory: "No search history yet",
    login: "Login",
    searchPlaceholder: "Search places, cuisines, services, cities",
    mobileSearchPlaceholder: "Search places, services, cities"
  },
  hi: {
    menu: "????",
    tools: "????? ?? ?????? ?????",
    language: "????",
    tips: "????? ?? ???????",
    help: "?????? ??????? ????",
    shareLocation: "???? ?????? ???? ????",
    sharePage: "?? ??? ???? ????",
    embed: "???? ?? ?????? ????",
    history: "??????",
    noHistory: "??? ??? ??? ?????? ????",
    login: "?????",
    searchPlaceholder: "???, ??????, ??? ?????",
    mobileSearchPlaceholder: "???, ??????, ??? ?????"
  },
  ur: {
    menu: "????",
    tools: "???? ??? ???? ???",
    language: "????",
    tips: "??? ??? ????",
    help: "??? ???? ????",
    shareLocation: "???? ?????? ???? ????",
    sharePage: "?? ???? ???? ????",
    embed: "???? ?? ?????? ????",
    history: "?????",
    noHistory: "???? ???? ??? ????? ????",
    login: "??? ??",
    searchPlaceholder: "??????? ?????? ??? ???? ????",
    mobileSearchPlaceholder: "??????? ?????? ??? ???? ????"
  },
  bn: {
    menu: "????",
    tools: "???? ??? ????? ???",
    language: "????",
    tips: "???? ??? ??????",
    help: "??????? ???",
    shareLocation: "???? ?????? ????? ????",
    sharePage: "?? ??? ????? ????",
    embed: "????? ?? ????? ????",
    history: "??????",
    noHistory: "???? ???? ????? ???????? ???",
    login: "????",
    searchPlaceholder: "?????, ???????, ??? ??????",
    mobileSearchPlaceholder: "?????, ???????, ??? ??????"
  },
  ta: {
    menu: "????",
    tools: "???????? ??????? ?????? ????????",
    language: "????",
    tips: "??????????? ??????? ?????????",
    help: "???? ?????????",
    shareLocation: "??? ???????????? ?????",
    sharePage: "???? ???????? ?????",
    embed: "????? ?????? ???????",
    history: "??????",
    noHistory: "????? ?????? ?????",
    login: "???????",
    searchPlaceholder: "???????, ???????, ???????? ?????????",
    mobileSearchPlaceholder: "???????, ???????, ???????? ?????????"
  }
};
const nav = [
  ["Home", "/"],
  ["Search", "/search"],
  ["Categories", "/categories"],
  ["Trending", "/trending"],
  ["Blog", "/blog"]
];

export function AppShell() {
  const { theme, toggleTheme, user, setUser } = useAppStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [hamburgerOpen, setHamburgerOpen] = useState(false);
  const [language, setLanguage] = useState(localStorage.getItem("reviewhub_language") ?? "en");
  const hamburgerRef = useRef<HTMLDivElement | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const t = labels[language as keyof typeof labels] ?? labels.en;

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setSearchTerm(params.get("q") ?? "");
  }, [location.search]);

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const q = searchTerm.trim();
    if (q) {
      const history = JSON.parse(localStorage.getItem("reviewhub_search_history") ?? "[]") as string[];
      localStorage.setItem("reviewhub_search_history", JSON.stringify([q, ...history.filter((item) => item.toLowerCase() !== q.toLowerCase())].slice(0, 10)));
    }
    navigate(q ? `/search?q=${encodeURIComponent(q)}` : "/search");
  }

  function handleLogout() {
    setAccountMenuOpen(false);
    setUser(undefined);
    navigate("/");
  }

  function handleLanguageChange(nextLanguage: string) {
    setLanguage(nextLanguage);
    localStorage.setItem("reviewhub_language", nextLanguage);
    toast.success(`${labels[nextLanguage as keyof typeof labels]?.language ?? "Language"} saved`);
  }

  async function copyText(value: string, message: string) {
    try {
      await navigator.clipboard.writeText(value);
      toast.success(message);
    } catch {
      toast.error("Copy failed. Please try again.");
    }
  }

  async function shareCurrentPage() {
    const shareData = { title: "ReviewHub", text: "Discover nearby places on ReviewHub", url: window.location.href };
    if (navigator.share) {
      await navigator.share(shareData).catch(() => undefined);
      return;
    }
    copyText(window.location.href, "Page link copied");
  }

  function shareLocation() {
    if (!navigator.geolocation) {
      toast.error("Location sharing is not supported in this browser");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const locationUrl = `${window.location.origin}/search?lat=${latitude}&lng=${longitude}`;
        copyText(locationUrl, "Location link copied");
      },
      () => toast.error("Allow location permission to share your location"),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  function copyEmbedCode() {
    const embedCode = `<iframe src="${window.location.origin}/search" width="100%" height="520" style="border:0;" loading="lazy" title="ReviewHub nearby search"></iframe>`;
    copyText(embedCode, "Embed code copied");
  }

  const searchHistory = JSON.parse(localStorage.getItem("reviewhub_search_history") ?? "[]") as string[];
  const accountMenu = [
    { label: "My Profile", href: "/dashboard/profile", icon: UserCircle },
    { label: "My Reviews", href: "/dashboard/reviews", icon: Star },
    { label: "Saved Places", href: "/dashboard/saved", icon: Bookmark },
    { label: "Notifications", href: "/dashboard/notifications", icon: Bell },
    { label: "Change Password", href: "/dashboard/password", icon: KeyRound },
    { label: "Settings", href: "/dashboard/settings", icon: Settings }
  ];

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 shadow-sm backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3">
          <Link to="/" className="bg-[linear-gradient(135deg,hsl(var(--foreground)),hsl(var(--primary)))] bg-clip-text text-xl font-bold text-transparent">
            ReviewHub
          </Link>
          <form onSubmit={handleSearch} className="hidden flex-1 items-center rounded-md border border-border bg-card px-3 py-2 md:flex">
            <Search className="h-4 w-4 text-slate-500" />
            <input
              className="ml-2 w-full bg-transparent text-sm outline-none"
              placeholder={t.searchPlaceholder}
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </form>
          <nav className="hidden items-center gap-2 md:flex">
            {nav.map(([label, href]) => (
              <NavLink key={href} className={({ isActive }) => `relative rounded-md px-3 py-2 text-sm transition hover:bg-muted ${isActive ? "bg-muted text-primary" : ""}`} to={href}>
                {label}
              </NavLink>
            ))}
          </nav>
          {user ? (
            <div className="relative">
              <button
                type="button"
                className="inline-flex h-10 max-w-[190px] items-center gap-2 rounded-md px-3 text-sm font-semibold hover:bg-muted"
                aria-expanded={accountMenuOpen}
                aria-haspopup="menu"
                onClick={() => setAccountMenuOpen((open) => !open)}
              >
                <UserCircle className="h-4 w-4" />
                <span className="hidden truncate sm:inline">{user.name}</span>
                <ChevronDown className="h-4 w-4" />
              </button>
              {accountMenuOpen ? (
                <div className="absolute right-0 mt-2 w-64 rounded-md border border-border bg-card p-2 shadow-lg" role="menu">
                  <div className="border-b border-border px-3 py-2">
                    <p className="truncate text-sm font-semibold">{user.name}</p>
                    <p className="truncate text-xs text-slate-500">{user.email}</p>
                  </div>
                  <div className="py-2">
                    {accountMenu.map((item) => {
                      const Icon = item.icon;
                      return (
                        <NavLink
                          key={item.href}
                          to={item.href}
                          className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted"
                          role="menuitem"
                          onClick={() => setAccountMenuOpen(false)}
                        >
                          <Icon className="h-4 w-4" />
                          {item.label}
                        </NavLink>
                      );
                    })}
                  </div>
                  <button
                    type="button"
                    className="flex w-full items-center gap-2 rounded-md border-t border-border px-3 py-2 text-left text-sm font-semibold text-red-600 hover:bg-muted"
                    role="menuitem"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </div>
              ) : null}
            </div>
          ) : (
            <Link to="/login" onClick={() => setHamburgerOpen(false)}>
              <Button variant="secondary">{t.login}</Button>
            </Link>
          )}
          <div ref={hamburgerRef} className="relative">
            <Button variant="ghost" aria-label="Open menu" onClick={() => setHamburgerOpen((open) => !open)}>
              {hamburgerOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
            {hamburgerOpen ? (
              <div className="absolute right-0 mt-2 w-[min(92vw,360px)] rounded-md border border-border bg-card p-3 shadow-lg">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <div>
                    <p className="font-semibold">{t.menu}</p>
                    <p className="text-xs text-slate-500">{t.tools}</p>
                  </div>
                  <button type="button" className="rounded-md p-2 hover:bg-muted" aria-label="Close menu" onClick={() => setHamburgerOpen(false)}>
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-3 grid gap-3">
                  <label className="grid gap-1 text-sm font-semibold">
                    <span className="inline-flex items-center gap-2"><Languages className="h-4 w-4" /> {t.language}</span>
                    <select className="rounded-md border border-border bg-background px-3 py-2 font-normal" value={language} onChange={(event) => handleLanguageChange(event.target.value)}>
                      <option value="en">English</option>
                      <option value="hi">Hindi</option>
                      <option value="ur">Urdu</option>
                      <option value="bn">Bengali</option>
                      <option value="ta">Tamil</option>
                    </select>
                  </label>

                  <div className="grid gap-1">
                    <NavLink className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted" to="/blog" onClick={() => setHamburgerOpen(false)}>
                      <Lightbulb className="h-4 w-4" /> {t.tips}
                    </NavLink>
                    <NavLink className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted" to="/contact" onClick={() => setHamburgerOpen(false)}>
                      <HelpCircle className="h-4 w-4" /> {t.help}
                    </NavLink>
                    <button type="button" className="flex items-center gap-2 rounded-md px-3 py-2 text-left text-sm hover:bg-muted" onClick={shareLocation}>
                      <MapPinned className="h-4 w-4" /> {t.shareLocation}
                    </button>
                    <button type="button" className="flex items-center gap-2 rounded-md px-3 py-2 text-left text-sm hover:bg-muted" onClick={shareCurrentPage}>
                      <Share2 className="h-4 w-4" /> {t.sharePage}
                    </button>
                    <button type="button" className="flex items-center gap-2 rounded-md px-3 py-2 text-left text-sm hover:bg-muted" onClick={copyEmbedCode}>
                      <Code2 className="h-4 w-4" /> {t.embed}
                    </button>
                  </div>

                  <div className="border-t border-border pt-3">
                    <p className="mb-2 flex items-center gap-2 text-sm font-semibold"><History className="h-4 w-4" /> {t.history}</p>
                    {searchHistory.length ? (
                      <div className="grid gap-1">
                        {searchHistory.slice(0, 6).map((item) => (
                          <NavLink key={item} className="truncate rounded-md px-3 py-2 text-sm hover:bg-muted" to={`/search?q=${encodeURIComponent(item)}`} onClick={() => setHamburgerOpen(false)}>
                            {item}
                          </NavLink>
                        ))}
                      </div>
                    ) : (
                      <p className="rounded-md bg-muted px-3 py-2 text-sm text-slate-500">{t.noHistory}</p>
                    )}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
          <Button variant="ghost" aria-label="Toggle theme" onClick={toggleTheme}>
            {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </Button>
        </div>
        <form onSubmit={handleSearch} className="border-t border-border px-4 py-3 md:hidden">
          <div className="flex items-center rounded-md border border-border bg-card px-3 py-2">
            <Search className="h-4 w-4 text-slate-500" />
            <input
              className="ml-2 w-full bg-transparent text-sm outline-none"
              placeholder={t.mobileSearchPlaceholder}
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>
        </form>
      </header>
      <main className="animate-[fadeIn_220ms_ease-out]">
        <Outlet />
      </main>
      <Footer />
      <Toaster position="top-right" />
    </div>
  );
}










