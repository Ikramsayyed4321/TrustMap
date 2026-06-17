import toast from "react-hot-toast";
import { useState } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Sparkles, Star, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { api } from "../../lib/api";
import { useAppStore } from "../../store/app.store";

type AuthMode = "login" | "signup";


function displayNameFromEmail(email: string) {
  return email.split("@")[0].replace(/[._-]+/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function getApiErrorMessage(error: any) {
  const data = error?.response?.data;
  const fieldErrors = data?.details?.fieldErrors;
  if (fieldErrors) {
    const first = Object.values(fieldErrors).flat().find(Boolean);
    if (first) return String(first);
  }
  if (!error?.response && error?.message) return "Cannot reach backend API. Make sure http://localhost:4000 is running.";
  return data?.message || data?.error || "Request failed. Please try again.";
}

export function LoginPage() {
  const setUser = useAppStore((state) => state.setUser);
  const [mode, setMode] = useState<AuthMode>("login");
  const [username, setUsername] = useState("Aarav Reviewer");
  const [email, setEmail] = useState("user@reviewhub.local");
  const [password, setPassword] = useState("password123");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  function switchMode(nextMode: AuthMode) {
    setMode(nextMode);
    if (nextMode === "signup") {
      setUsername("");
      setEmail("");
      setPassword("");
    } else {
      setUsername("Aarav Reviewer");
      setEmail("user@reviewhub.local");
      setPassword("password123");
    }
  }

  function finishAuth(data: any) {
    localStorage.setItem("reviewhub_access_token", data.accessToken);
    if (data.refreshToken) localStorage.setItem("reviewhub_refresh_token", data.refreshToken);
    const fallbackName = username.trim() || displayNameFromEmail(data.user.email || email);
    setUser({ ...data.user, name: data.user.name || fallbackName });
    navigate(data.user.role === "admin" ? "/admin" : "/dashboard/reviews");
  }

  async function submitAuth() {
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = username.trim();

    if (!cleanEmail || !password) {
      toast.error("Email and password are required");
      return;
    }

    if (mode === "signup" && cleanName.length < 2) {
      toast.error("Please enter your full username");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      const endpoint = mode === "signup" ? "/auth/register" : "/auth/login";
      const payload = mode === "signup" ? { name: cleanName, email: cleanEmail, password, role: "reviewer" } : { email: cleanEmail, password };
      const { data } = await api.post(endpoint, payload);
      finishAuth(data);
      toast.success(mode === "signup" ? "Account created and saved" : "Signed in successfully");
    } catch (error: any) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }


  return (
    <div className="relative overflow-hidden px-4 py-10">
      <div className="premium-grid absolute inset-0 opacity-60" />
      <div className="relative mx-auto grid min-h-[calc(100vh-160px)] max-w-7xl items-center gap-10 lg:grid-cols-[1fr_460px]">
        <motion.section initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/80 px-3 py-1 text-sm shadow-sm backdrop-blur">
            <Sparkles className="h-4 w-4 text-primary" />
            Trusted reviews. Better local decisions.
          </div>
          <h1 className="mt-5 text-5xl font-bold leading-tight md:text-7xl">
            {mode === "signup" ? "Create your local discovery profile." : "Sign in to manage your local discovery profile."}
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300">
            New users can create reviewer accounts. Business owner and admin roles are assigned only by an admin from the dashboard.
          </p>
          <div className="mt-8 grid max-w-2xl gap-4 sm:grid-cols-3">
            {[
              [Users, "24K+", "active users"],
              [Star, "188K", "reviews"],
              [ShieldCheck, "99%", "moderated"]
            ].map(([Icon, value, label]) => (
              <Card key={String(label)} className="p-4">
                <Icon className="h-5 w-5 text-primary" />
                <p className="mt-3 text-2xl font-bold">{String(value)}</p>
                <p className="text-xs text-slate-500">{String(label)}</p>
              </Card>
            ))}
          </div>
        </motion.section>

        <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}>
          <Card className="glass p-6">
            <div className="grid grid-cols-2 rounded-lg border border-border bg-background/70 p-1 text-sm font-semibold">
              <button type="button" className={`rounded-md px-3 py-2 transition ${mode === "login" ? "bg-primary text-white shadow-sm" : "text-slate-500 hover:text-foreground"}`} onClick={() => switchMode("login")}>Sign in</button>
              <button type="button" className={`rounded-md px-3 py-2 transition ${mode === "signup" ? "bg-primary text-white shadow-sm" : "text-slate-500 hover:text-foreground"}`} onClick={() => switchMode("signup")}>Sign up</button>
            </div>

            <h2 className="mt-6 text-2xl font-bold">{mode === "signup" ? "Create account" : "Welcome back"}</h2>
            <p className="mt-2 text-sm text-slate-500">
              {mode === "signup" ? "Your name, email, and encrypted password will be stored in the database as a reviewer account." : "Use your real account details. Admin access is available only for users with the admin role."}
            </p>

            <div className="my-5 flex items-center gap-3 text-xs text-slate-500">
              <span className="h-px flex-1 bg-border" /> Account details <span className="h-px flex-1 bg-border" />
            </div>
            <div className="grid gap-3">
              <input className="rounded-md border border-border bg-background/80 px-3 py-3 outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" placeholder="Username / full name" value={username} onChange={(event) => setUsername(event.target.value)} />
              <input className="rounded-md border border-border bg-background/80 px-3 py-3 outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" placeholder={mode === "signup" ? "your@email.com" : "Email"} value={email} onChange={(event) => setEmail(event.target.value)} />
              <input className="rounded-md border border-border bg-background/80 px-3 py-3 outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10" placeholder="Password (min 6 characters)" type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
              <Button className="h-12" onClick={submitAuth} disabled={loading}>{loading ? "Please wait..." : mode === "signup" ? "Create account" : "Sign in"}</Button>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}








