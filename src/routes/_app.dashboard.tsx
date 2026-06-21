import { createFileRoute } from "@tanstack/react-router";
import { BedDouble, CalendarCheck2, DoorOpen, Wallet, TrendingUp, ArrowDownRight, ArrowUpRight } from "lucide-react";
import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useHotel, bookingTotal } from "@/lib/hotel-store";
import { HOTEL_NAME } from "@/lib/hotel-data";
import {
  Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, PieChart, Pie, Cell, Legend,
} from "recharts";

export const Route = createFileRoute("/_app/dashboard")({
  head: () => ({ meta: [{ title: `Dashboard — ${HOTEL_NAME}` }] }),
  component: DashboardPage,
});

function DashboardPage() {
  const { rooms, bookings, guests } = useHotel();
  const today = new Date().toISOString().slice(0, 10);

  const stats = useMemo(() => {
    const total = rooms.length;
    const occupied = rooms.filter((r) => r.status === "Occupied").length;
    const available = rooms.filter((r) => r.status === "Available").length;
    const maintenance = rooms.filter((r) => r.status === "Maintenance").length;
    const todaysCheckins = bookings.filter((b) => b.checkIn === today).length;
    const revenue = bookings
      .filter((b) => b.payment === "Paid")
      .reduce((sum, b) => sum + bookingTotal(b, rooms.find((r) => r.id === b.roomId)), 0);
    const pending = bookings
      .filter((b) => b.payment === "Pending")
      .reduce((sum, b) => sum + bookingTotal(b, rooms.find((r) => r.id === b.roomId)), 0);
    return { total, occupied, available, maintenance, todaysCheckins, revenue, pending };
  }, [rooms, bookings, today]);

  const occupancy = stats.total ? Math.round((stats.occupied / stats.total) * 100) : 0;

  const revenueSeries = useMemo(() => {
    const days = 7;
    const out: Array<{ day: string; revenue: number }> = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const label = d.toLocaleDateString(undefined, { weekday: "short" });
      const base = 1200 + Math.round(Math.sin(i / 1.4) * 400 + Math.random() * 350);
      out.push({ day: label, revenue: base });
    }
    return out;
  }, []);

  const pieData = [
    { name: "Occupied", value: stats.occupied, color: "var(--gold)" },
    { name: "Available", value: stats.available, color: "oklch(0.55 0.08 50)" },
    { name: "Maintenance", value: stats.maintenance, color: "oklch(0.4 0.05 70)" },
  ];

  const recent = [...bookings].slice(0, 6);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl">Good evening, welcome to <span className="text-gold-gradient">{HOTEL_NAME}</span></h1>
          <p className="mt-1 text-sm text-muted-foreground">A glance at tonight's operations and revenue.</p>
        </div>
        <Badge variant="outline" className="border-[var(--gold)]/40 text-[var(--gold)]">Live · {new Date().toLocaleDateString()}</Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={BedDouble} label="Total Rooms" value={stats.total.toString()} trend="+2 this month" up />
        <StatCard icon={DoorOpen} label="Occupied" value={`${stats.occupied} / ${stats.total}`} trend={`${occupancy}% occupancy`} up />
        <StatCard icon={CalendarCheck2} label="Today's Check-ins" value={stats.todaysCheckins.toString()} trend={`${guests.length} guests on file`} />
        <StatCard icon={Wallet} label="Revenue (paid)" value={`$${stats.revenue.toLocaleString()}`} trend={`$${stats.pending.toLocaleString()} pending`} up />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="glass border-0 lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="font-display">Revenue · last 7 days</CardTitle>
              <p className="text-xs text-muted-foreground">Trailing operational revenue</p>
            </div>
            <div className="flex items-center gap-1 text-xs text-[var(--success)]"><TrendingUp className="h-3.5 w-3.5" /> +14.2%</div>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueSeries} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
                <defs>
                  <linearGradient id="goldFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.82 0.13 85)" stopOpacity={0.6} />
                    <stop offset="100%" stopColor="oklch(0.82 0.13 85)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="oklch(1 0 0 / 6%)" vertical={false} />
                <XAxis dataKey="day" stroke="oklch(0.7 0.02 80)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="oklch(0.7 0.02 80)" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "oklch(0.2 0.01 60)", border: "1px solid oklch(1 0 0 / 10%)", borderRadius: 12 }} labelStyle={{ color: "oklch(0.92 0.01 80)" }} />
                <Area type="monotone" dataKey="revenue" stroke="oklch(0.82 0.13 85)" strokeWidth={2} fill="url(#goldFill)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="glass border-0">
          <CardHeader>
            <CardTitle className="font-display">Room status</CardTitle>
            <p className="text-xs text-muted-foreground">Current floor inventory</p>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={3}>
                  {pieData.map((d, i) => <Cell key={i} fill={d.color} stroke="transparent" />)}
                </Pie>
                <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="glass border-0">
        <CardHeader>
          <CardTitle className="font-display">Recent activity</CardTitle>
          <p className="text-xs text-muted-foreground">Latest reservations and stays</p>
        </CardHeader>
        <CardContent>
          <div className="divide-y divide-border/60">
            {recent.map((b) => {
              const guest = guests.find((g) => g.id === b.guestId);
              const room = rooms.find((r) => r.id === b.roomId);
              const total = bookingTotal(b, room);
              const inbound = b.status === "Checked-In" || b.status === "Reserved";
              return (
                <div key={b.id} className="flex flex-wrap items-center gap-4 py-3">
                  <div className={`grid h-9 w-9 shrink-0 place-items-center rounded-full ${inbound ? "bg-[var(--success)]/15 text-[var(--success)]" : "bg-muted text-muted-foreground"}`}>
                    {inbound ? <ArrowDownRight className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-medium">{guest?.name ?? "Unknown guest"}</div>
                    <div className="text-xs text-muted-foreground">Room {room?.number} · {room?.type} · {b.checkIn} → {b.checkOut}</div>
                  </div>
                  <Badge variant="outline" className="border-border/60">{b.status}</Badge>
                  <div className="w-24 text-right font-mono text-sm">${total.toLocaleString()}</div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, trend, up }: { icon: typeof BedDouble; label: string; value: string; trend: string; up?: boolean }) {
  return (
    <Card className="glass border-0">
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
          <div className="grid h-9 w-9 place-items-center rounded-lg gold-gradient text-[oklch(0.15_0.01_60)]">
            <Icon className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-3 font-display text-3xl">{value}</div>
        <div className={`mt-1 text-xs ${up ? "text-[var(--success)]" : "text-muted-foreground"}`}>{trend}</div>
      </CardContent>
    </Card>
  );
}
