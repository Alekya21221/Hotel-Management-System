import { createFileRoute, Outlet, useNavigate, useRouterState, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Bell, Search } from "lucide-react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { useAuth } from "@/lib/auth-store";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/_app")({
  // Auth state lives in localStorage; render shell on client only to avoid SSR hydration drift.
  ssr: false,
  component: AppLayout,
});

const STAFF_ROUTES = ["/dashboard", "/rooms", "/guests", "/bookings", "/billing"];
const GUEST_ROUTES = ["/portal"];

function AppLayout() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!user) {
      navigate({ to: "/login" });
      return;
    }
    if (user.role === "guest" && STAFF_ROUTES.some((r) => path.startsWith(r))) {
      navigate({ to: "/portal" });
    }
    if (user.role !== "guest" && GUEST_ROUTES.some((r) => path.startsWith(r))) {
      navigate({ to: "/dashboard" });
    }
  }, [user, mounted, path, navigate]);

  if (!mounted || !user) return null;

  const segment = path.split("/")[1] ?? "dashboard";
  const title = segment === "portal" ? "My Stay" : segment.charAt(0).toUpperCase() + segment.slice(1);

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <div className="flex flex-1 flex-col min-w-0">
          <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border/60 bg-background/70 px-4 backdrop-blur-xl">
            <SidebarTrigger />
            <div className="hidden md:block">
              <div className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">{user.role === "guest" ? "Guest" : "Concierge"}</div>
              <div className="font-display text-lg leading-none">{title}</div>
            </div>
            {user.role !== "guest" && (
              <div className="relative ml-auto hidden sm:block w-72">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Search guests, rooms…" className="pl-9 bg-card/50" />
              </div>
            )}
            <button className={`${user.role === "guest" ? "ml-auto" : ""} relative grid h-9 w-9 place-items-center rounded-full border border-border/60 bg-card/40 transition-colors hover:bg-accent`} aria-label="Notifications">
              <Bell className="h-4 w-4" />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[var(--gold)] shadow-[0_0_0_3px_var(--background)]" />
            </button>
            <Link to={user.role === "guest" ? "/portal" : "/dashboard"} className="flex shrink-0 items-center gap-2 rounded-full border border-border/60 bg-card/40 py-1 pl-1 pr-3 transition-colors hover:bg-accent">
              <span className="grid h-7 w-7 place-items-center rounded-full gold-gradient text-xs font-semibold text-[oklch(0.15_0.01_60)]">{user.name.charAt(0)}</span>
              <span className="hidden text-xs sm:block">
                <span className="block leading-tight">{user.name}</span>
                <span className="block text-[10px] uppercase tracking-wider text-muted-foreground">{user.role}</span>
              </span>
            </Link>
          </header>
          <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
