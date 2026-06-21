import { createFileRoute, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Crown, ShieldCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useAuth, DEMO_CREDENTIALS } from "@/lib/auth-store";
import { useHotel } from "@/lib/hotel-store";
import { HOTEL_NAME } from "@/lib/hotel-data";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: `Sign in — ${HOTEL_NAME}` }] }),
  component: LoginPage,
});

function LoginPage() {
  const { user, login, signupGuest } = useAuth();
  const { addGuest } = useHotel();
  const navigate = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });

  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState<string | null>(null);

  const [su, setSu] = useState({ username: "", password: "", name: "", phone: "", email: "", address: "" });
  const [suError, setSuError] = useState<string | null>(null);

  useEffect(() => {
    if (user && path === "/login") {
      navigate({ to: user.role === "guest" ? "/portal" : "/dashboard" });
    }
  }, [user, path, navigate]);

  function submitLogin(e: React.FormEvent) {
    e.preventDefault();
    const res = login(username, password);
    if (!res.ok) return setError(res.error ?? "Login failed");
    setError(null);
  }

  function submitSignup(e: React.FormEvent) {
    e.preventDefault();
    setSuError(null);
    if (!su.name.trim() || !su.username.trim() || !su.password) {
      setSuError("Name, username and password are required");
      return;
    }
    const guest = addGuest({ name: su.name, phone: su.phone, email: su.email, idProof: "", address: su.address });
    const res = signupGuest({ username: su.username, password: su.password, name: su.name, guestId: guest.id });
    if (!res.ok) setSuError(res.error ?? "Sign-up failed");
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden lg:flex flex-col justify-between p-12 overflow-hidden">
        <div className="absolute inset-0 -z-10 gold-gradient opacity-[0.06]" />
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_30%_20%,oklch(0.82_0.13_85/0.18),transparent_60%)]" />
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-xl gold-gradient text-[oklch(0.15_0.01_60)]">
            <Crown className="h-5 w-5" />
          </div>
          <div className="font-display text-lg text-gold-gradient">{HOTEL_NAME}</div>
        </div>
        <div>
          <h1 className="font-display text-5xl leading-tight">A timeless welcome,<br /><span className="text-gold-gradient">refined for every guest.</span></h1>
          <p className="mt-6 max-w-md text-muted-foreground">Reserve a suite, manage your stay and settle your bill — all from one elegant portal.</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <ShieldCheck className="h-4 w-4 text-[var(--gold)]" />
          Role-based access · Encrypted sessions
        </div>
      </div>

      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-md glass rounded-2xl p-8">
          <div className="mb-6 lg:hidden flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl gold-gradient text-[oklch(0.15_0.01_60)]">
              <Crown className="h-5 w-5" />
            </div>
            <div className="font-display text-lg text-gold-gradient">{HOTEL_NAME}</div>
          </div>

          <Tabs defaultValue="signin">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign in</TabsTrigger>
              <TabsTrigger value="signup">Create guest account</TabsTrigger>
            </TabsList>

            <TabsContent value="signin" className="mt-6">
              <h2 className="font-display text-2xl">Welcome back</h2>
              <p className="mt-1 text-sm text-muted-foreground">Sign in to continue.</p>
              <form onSubmit={submitLogin} className="mt-6 space-y-4">
                <div className="space-y-2"><Label htmlFor="u">Username</Label>
                  <Input id="u" value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" required /></div>
                <div className="space-y-2"><Label htmlFor="p">Password</Label>
                  <Input id="p" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required /></div>
                {error && <p className="text-sm text-destructive">{error}</p>}
                <Button type="submit" className="w-full gold-gradient text-[oklch(0.15_0.01_60)] hover:opacity-95">Sign in</Button>
              </form>

              <div className="mt-6 rounded-lg border border-border/60 p-3 text-xs">
                <div className="mb-2 font-medium uppercase tracking-wider text-muted-foreground">Demo accounts</div>
                <ul className="space-y-1 text-muted-foreground">
                  {DEMO_CREDENTIALS.map((c) => (
                    <li key={c.username} className="flex justify-between gap-3 font-mono">
                      <span>{c.username} / {c.password}</span>
                      <span className="text-[var(--gold)]">{c.role}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </TabsContent>

            <TabsContent value="signup" className="mt-6">
              <h2 className="font-display text-2xl">Reserve your place</h2>
              <p className="mt-1 text-sm text-muted-foreground">Create a guest account to book rooms and settle bills.</p>
              <form onSubmit={submitSignup} className="mt-6 space-y-3">
                <div className="space-y-2"><Label>Full name</Label>
                  <Input value={su.name} onChange={(e) => setSu({ ...su, name: e.target.value })} required /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2"><Label>Username</Label>
                    <Input value={su.username} onChange={(e) => setSu({ ...su, username: e.target.value })} required /></div>
                  <div className="space-y-2"><Label>Password</Label>
                    <Input type="password" value={su.password} onChange={(e) => setSu({ ...su, password: e.target.value })} required /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2"><Label>Phone</Label>
                    <Input value={su.phone} onChange={(e) => setSu({ ...su, phone: e.target.value })} /></div>
                  <div className="space-y-2"><Label>Email</Label>
                    <Input type="email" value={su.email} onChange={(e) => setSu({ ...su, email: e.target.value })} /></div>
                </div>
                <div className="space-y-2"><Label>Address</Label>
                  <Textarea value={su.address} onChange={(e) => setSu({ ...su, address: e.target.value })} /></div>
                {suError && <p className="text-sm text-destructive">{suError}</p>}
                <Button type="submit" className="w-full gold-gradient text-[oklch(0.15_0.01_60)] hover:opacity-95">Create account</Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
