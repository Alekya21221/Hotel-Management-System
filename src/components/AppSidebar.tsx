import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, BedDouble, Users, CalendarRange, Receipt, LogOut, Crown } from "lucide-react";
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarHeader,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar,
} from "@/components/ui/sidebar";
import { HOTEL_NAME } from "@/lib/hotel-data";
import { useAuth } from "@/lib/auth-store";

const staffItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Rooms", url: "/rooms", icon: BedDouble },
  { title: "Guests", url: "/guests", icon: Users },
  { title: "Bookings", url: "/bookings", icon: CalendarRange },
  { title: "Billing", url: "/billing", icon: Receipt },
];

const guestItems = [
  { title: "My Stay", url: "/portal", icon: Crown },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const path = useRouterState({ select: (r) => r.location.pathname });
  const { user, logout } = useAuth();
  const items = user?.role === "guest" ? guestItems : staffItems;

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border/60">
        <div className="flex items-center gap-3 px-2 py-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl gold-gradient text-[oklch(0.15_0.01_60)] shadow-lg">
            <Crown className="h-5 w-5" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <div className="font-display text-base leading-tight text-gold-gradient truncate">{HOTEL_NAME}</div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                {user?.role === "guest" ? "Guest Portal" : "Concierge Suite"}
              </div>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const active = path.startsWith(item.url);
                return (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton asChild isActive={active} tooltip={item.title}>
                      <Link to={item.url} className="flex items-center gap-3">
                        <item.icon className="h-4 w-4" />
                        {!collapsed && <span>{item.title}</span>}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border/60">
        <div className="flex items-center gap-3 px-2 py-3">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-accent text-sm font-semibold text-gold-gradient">
            {user?.name.charAt(0)}
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium">{user?.name}</div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{user?.role}</div>
            </div>
          )}
          {!collapsed && (
            <button onClick={logout} className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground" aria-label="Sign out">
              <LogOut className="h-4 w-4" />
            </button>
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
