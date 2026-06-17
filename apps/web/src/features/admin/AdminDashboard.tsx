import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, ArrowUpRight, Building2, Clock, ShieldCheck, Star, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import toast from "react-hot-toast";
import { Card } from "../../components/ui/Card";
import { api } from "../../lib/api";

type AdminRole = "admin" | "reviewer" | "owner";

type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  isBanned: boolean;
  reputationPoints: number;
  lastLoginAt?: string | null;
  createdAt: string;
};

type Analytics = {
  totals: {
    users: number;
    reviewers: number;
    owners: number;
    admins: number;
    reviews: number;
    businesses: number;
    openReports: number;
  };
  recentUsers: AdminUser[];
};

const emptyAnalytics: Analytics = {
  totals: { users: 0, reviewers: 0, owners: 0, admins: 0, reviews: 0, businesses: 0, openReports: 0 },
  recentUsers: []
};

const actions = [
  [ShieldCheck, "Review moderation", "Resolve flagged reviews and trust signals."],
  [Building2, "Business queue", "Approve ownership and listing updates."],
  [Clock, "Recent users", "Audit new signups and login activity."],
  [Users, "User management", "Promote users to reviewer, business owner, or admin."]
] as Array<[LucideIcon, string, string]>;

function formatNumber(value: number) {
  return new Intl.NumberFormat().format(value);
}

function formatDate(value?: string | null) {
  if (!value) return "Never";
  return new Date(value).toLocaleString();
}

export function AdminDashboard() {
  const [analytics, setAnalytics] = useState<Analytics>(emptyAnalytics);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

  async function loadAdminData(active = true) {
    setLoading(true);
    try {
      const [analyticsResponse, usersResponse] = await Promise.all([
        api.get<Analytics>("/admin/analytics"),
        api.get<AdminUser[]>("/admin/users")
      ]);
      if (!active) return;
      setAnalytics(analyticsResponse.data);
      setUsers(usersResponse.data);
    } catch (error: any) {
      toast.error(error?.response?.status === 403 ? "Only admins can view this dashboard" : "Unable to load admin data");
    } finally {
      if (active) setLoading(false);
    }
  }

  useEffect(() => {
    let active = true;
    loadAdminData(active);
    return () => {
      active = false;
    };
  }, []);

  async function updateUserRole(userId: string, role: AdminRole) {
    const previousUsers = users;
    setUpdatingUserId(userId);
    setUsers((current) => current.map((user) => (user.id === userId ? { ...user, role } : user)));

    try {
      const { data } = await api.patch<AdminUser>(`/admin/users/${userId}/role`, { role });
      setUsers((current) => current.map((user) => (user.id === userId ? data : user)));
      toast.success(`User role changed to ${role}`);
      await loadAdminData(true);
    } catch (error: any) {
      setUsers(previousUsers);
      toast.error(error?.response?.data?.message || "Unable to update user role");
    } finally {
      setUpdatingUserId(null);
    }
  }

  const stats: Array<[string, string, string, LucideIcon]> = [
    ["Total Users", formatNumber(analytics.totals.users), `${formatNumber(analytics.totals.reviewers)} reviewers`, Users],
    ["Total Reviews", formatNumber(analytics.totals.reviews), "stored in database", Star],
    ["Businesses", formatNumber(analytics.totals.businesses), `${formatNumber(analytics.totals.owners)} owners`, Building2],
    ["Open Reports", formatNumber(analytics.totals.openReports), "admin only", AlertTriangle]
  ];

  const signupChart = useMemo(() => {
    const days = Array.from({ length: 7 }, (_, index) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - index));
      return {
        name: date.toLocaleDateString(undefined, { weekday: "short" }),
        dateKey: date.toISOString().slice(0, 10),
        users: 0,
        reviewers: 0,
        owners: 0
      };
    });

    users.forEach((user) => {
      const key = new Date(user.createdAt).toISOString().slice(0, 10);
      const day = days.find((item) => item.dateKey === key);
      if (!day) return;
      day.users += 1;
      if (user.role === "reviewer") day.reviewers += 1;
      if (user.role === "owner") day.owners += 1;
    });

    return days;
  }, [users]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">Admin only</p>
          <h1 className="mt-2 text-4xl font-bold">Admin Dashboard</h1>
          <p className="mt-2 text-slate-500">Monitor real users, signups, reviews, businesses, and moderation data from the database.</p>
        </div>
        <div className="rounded-md border border-border bg-card/70 px-4 py-2 text-sm shadow-sm backdrop-blur">
          {loading ? "Loading live data..." : `${formatNumber(users.length)} latest users loaded`}
        </div>
      </motion.div>

      <div className="mt-7 grid gap-4 md:grid-cols-4">
        {stats.map(([label, value, trend, Icon], index) => (
          <motion.div key={label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.06 }}>
            <Card className="p-5">
              <div className="flex items-center justify-between">
                <span className="rounded-md bg-primary/10 p-2 text-primary"><Icon className="h-5 w-5" /></span>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary">{trend} <ArrowUpRight className="h-3 w-3" /></span>
              </div>
              <p className="mt-5 text-sm text-slate-500">{label}</p>
              <p className="mt-1 text-3xl font-bold">{loading ? "..." : value}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      <Card className="mt-6 p-5">
        <div className="mb-5 flex flex-col justify-between gap-3 md:flex-row md:items-center">
          <div>
            <h2 className="text-xl font-semibold">Signup Activity</h2>
            <p className="text-sm text-slate-500">New user registrations from the last 7 days.</p>
          </div>
        </div>
        <div className="h-80">
          <ResponsiveContainer>
            <AreaChart data={signupChart}>
              <defs>
                <linearGradient id="users" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.28} />
                  <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid hsl(var(--border))" }} />
              <Area dataKey="users" fill="url(#users)" stroke="#4f46e5" strokeWidth={3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="mt-6 overflow-hidden p-0">
        <div className="border-b border-border p-5">
          <h2 className="text-xl font-semibold">Users</h2>
          <p className="text-sm text-slate-500">Only admins can view and change user roles. Passwords and token hashes are never shown.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="bg-muted/60 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-5 py-3">User</th>
                <th className="px-5 py-3">Role</th>
                <th className="px-5 py-3">Signup Date</th>
                <th className="px-5 py-3">Last Login</th>
                <th className="px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-t border-border transition hover:bg-muted/40">
                  <td className="px-5 py-4">
                    <p className="font-semibold">{user.name}</p>
                    <p className="text-xs text-slate-500">{user.email}</p>
                  </td>
                  <td className="px-5 py-4">
                    <select
                      className="rounded-md border border-border bg-background px-2 py-2 text-sm capitalize outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10 disabled:opacity-60"
                      value={user.role}
                      disabled={updatingUserId === user.id}
                      onChange={(event) => updateUserRole(user.id, event.target.value as AdminRole)}
                    >
                      <option value="reviewer">Reviewer</option>
                      <option value="owner">Business owner</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="px-5 py-4">{formatDate(user.createdAt)}</td>
                  <td className="px-5 py-4">{formatDate(user.lastLoginAt)}</td>
                  <td className="px-5 py-4">
                    <span className={`rounded-full px-2 py-1 text-xs font-semibold ${user.isBanned ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"}`}>
                      {user.isBanned ? "Banned" : "Active"}
                    </span>
                  </td>
                </tr>
              ))}
              {!loading && users.length === 0 && (
                <tr>
                  <td className="px-5 py-8 text-center text-slate-500" colSpan={5}>No signed-up users found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="mt-6 grid gap-4 md:grid-cols-4">
        {actions.map(([Icon, title, text]) => (
          <Card key={title} className="p-5">
            <Icon className="h-5 w-5 text-primary" />
            <h3 className="mt-4 font-semibold">{title}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-500">{text}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
