import { create } from "zustand";

type User = {
  id: string;
  name: string;
  email: string;
  role: "admin" | "reviewer" | "owner";
};

type AppState = {
  user?: User;
  theme: "light" | "dark";
  setUser: (user?: User) => void;
  toggleTheme: () => void;
};

function getStoredUser() {
  const raw = localStorage.getItem("reviewhub_user");
  if (!raw) return undefined;

  try {
    const user = JSON.parse(raw) as User;
    if (user.role === "reviewer" && user.name.toLowerCase() === "reviewer") {
      const name = user.email.split("@")[0].replace(/[._-]+/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
      return { ...user, name };
    }
    return user;
  } catch {
    localStorage.removeItem("reviewhub_user");
    return undefined;
  }
}

export const useAppStore = create<AppState>((set, get) => ({
  user: getStoredUser(),
  theme: "light",
  setUser: (user) => {
    if (user) {
      localStorage.setItem("reviewhub_user", JSON.stringify(user));
    } else {
      localStorage.removeItem("reviewhub_user");
      localStorage.removeItem("reviewhub_access_token");
    }
    set({ user });
  },
  toggleTheme: () => {
    const next = get().theme === "light" ? "dark" : "light";
    document.documentElement.classList.toggle("dark", next === "dark");
    set({ theme: next });
  }
}));
