import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { seedGuests } from "./hotel-data";

export type Role = "admin" | "staff" | "guest";
export interface AuthUser {
  username: string;
  role: Role;
  name: string;
  /** Linked guest id when role === "guest" */
  guestId?: string;
}

const KEY = "monarch.auth.v1";
const ACCOUNTS_KEY = "monarch.accounts.v1";

interface Account { username: string; password: string; role: Role; name: string; guestId?: string }

const DEFAULT_ACCOUNTS: Account[] = [
  { username: "admin", password: "admin123", role: "admin", name: "Eleanor Voss" },
  { username: "staff", password: "staff123", role: "staff", name: "Marcus Hale" },
  // Pre-linked guest demo account (matches seedGuests[0] — Amelia Laurent, id "g1")
  { username: "guest", password: "guest123", role: "guest", name: seedGuests[0].name, guestId: seedGuests[0].id },
];

interface AuthCtx {
  user: AuthUser | null;
  login: (username: string, password: string) => { ok: boolean; error?: string };
  signupGuest: (input: { username: string; password: string; name: string; guestId: string }) => { ok: boolean; error?: string };
  logout: () => void;
}

const Ctx = createContext<AuthCtx | null>(null);

function loadAccounts(): Account[] {
  if (typeof window === "undefined") return DEFAULT_ACCOUNTS;
  try {
    const raw = localStorage.getItem(ACCOUNTS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Account[];
      // Ensure defaults are always present
      const merged = [...parsed];
      for (const def of DEFAULT_ACCOUNTS) {
        if (!merged.some((a) => a.username === def.username)) merged.push(def);
      }
      return merged;
    }
  } catch {/* noop */}
  return DEFAULT_ACCOUNTS;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  // Always start with null on both server and client to avoid hydration mismatch.
  const [hydrated, setHydrated] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [accounts, setAccounts] = useState<Account[]>(DEFAULT_ACCOUNTS);

  useEffect(() => {
    setAccounts(loadAccounts());
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setUser(JSON.parse(raw));
    } catch {/* noop */}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      if (user) localStorage.setItem(KEY, JSON.stringify(user));
      else localStorage.removeItem(KEY);
    } catch {/* noop */}
  }, [user, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    try { localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts)); } catch {/* noop */}
  }, [accounts, hydrated]);

  const login: AuthCtx["login"] = (username, password) => {
    const found = accounts.find((u) => u.username === username.trim().toLowerCase() && u.password === password);
    if (!found) return { ok: false, error: "Invalid username or password" };
    setUser({ username: found.username, role: found.role, name: found.name, guestId: found.guestId });
    return { ok: true };
  };

  const signupGuest: AuthCtx["signupGuest"] = (input) => {
    const username = input.username.trim().toLowerCase();
    if (!username || !input.password || !input.name.trim()) return { ok: false, error: "Username, password and name are required" };
    if (accounts.some((a) => a.username === username)) return { ok: false, error: "That username is already taken" };

    const account: Account = { username, password: input.password, role: "guest", name: input.name, guestId: input.guestId };
    setAccounts((a) => [...a, account]);
    setUser({ username, role: "guest", name: input.name, guestId: input.guestId });
    return { ok: true };
  };

  return <Ctx.Provider value={{ user, login, signupGuest, logout: () => setUser(null) }}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}

export const DEMO_CREDENTIALS = DEFAULT_ACCOUNTS.map(({ username, password, role }) => ({ username, password, role }));
