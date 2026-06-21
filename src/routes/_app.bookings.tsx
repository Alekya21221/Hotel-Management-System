import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus, LogIn, LogOut, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { useHotel, nightsBetween, bookingTotal } from "@/lib/hotel-store";
import { HOTEL_NAME, type BookingStatus } from "@/lib/hotel-data";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/bookings")({
  head: () => ({ meta: [{ title: `Bookings — ${HOTEL_NAME}` }] }),
  component: BookingsPage,
});

const STATUSES: Array<BookingStatus | "All"> = ["All", "Reserved", "Checked-In", "Checked-Out", "Cancelled"];
const statusStyle: Record<BookingStatus, string> = {
  "Reserved": "bg-[var(--warning)]/15 text-[var(--warning)] border-[var(--warning)]/30",
  "Checked-In": "bg-[var(--success)]/15 text-[var(--success)] border-[var(--success)]/30",
  "Checked-Out": "bg-muted text-muted-foreground border-border",
  "Cancelled": "bg-destructive/15 text-destructive border-destructive/30",
};

function BookingsPage() {
  const { rooms, guests, bookings, addBooking, setBookingStatus, updateRoom } = useHotel();
  const today = new Date().toISOString().slice(0, 10);
  const tomorrow = (() => { const d = new Date(); d.setDate(d.getDate() + 1); return d.toISOString().slice(0, 10); })();

  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState<typeof STATUSES[number]>("All");
  const [draft, setDraft] = useState({ guestId: guests[0]?.id ?? "", roomId: rooms[0]?.id ?? "", checkIn: today, checkOut: tomorrow, extras: 0 });

  const visible = useMemo(() => bookings.filter((b) => filter === "All" || b.status === filter), [bookings, filter]);

  function submit() {
    if (!draft.guestId || !draft.roomId) return toast.error("Pick a guest and a room");
    const res = addBooking(draft);
    if (!res.ok) return toast.error(res.error ?? "Could not create booking");
    toast.success("Booking created");
    setOpen(false);
  }

  function checkIn(id: string) { setBookingStatus(id, "Checked-In"); toast.success("Guest checked in"); }
  function checkOut(id: string) { setBookingStatus(id, "Checked-Out"); toast.success("Guest checked out"); }
  function cancel(id: string, roomId: string) { setBookingStatus(id, "Cancelled"); updateRoom(roomId, { status: "Available" }); toast.success("Booking cancelled"); }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl">Bookings</h1>
          <p className="mt-1 text-sm text-muted-foreground">{bookings.length} reservations in the system</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
            <SelectTrigger className="w-44 bg-card/40"><SelectValue /></SelectTrigger>
            <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
          </Select>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gold-gradient text-[oklch(0.15_0.01_60)] hover:opacity-95"><Plus className="mr-1 h-4 w-4" /> New booking</Button>
            </DialogTrigger>
            <DialogContent className="glass border-0 sm:max-w-md">
              <DialogHeader><DialogTitle className="font-display">Reserve a room</DialogTitle></DialogHeader>
              <div className="grid gap-3 py-2">
                <div className="space-y-2">
                  <Label>Guest</Label>
                  <Select value={draft.guestId} onValueChange={(v) => setDraft({ ...draft, guestId: v })}>
                    <SelectTrigger><SelectValue placeholder="Pick a guest" /></SelectTrigger>
                    <SelectContent>{guests.map((g) => <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Room</Label>
                  <Select value={draft.roomId} onValueChange={(v) => setDraft({ ...draft, roomId: v })}>
                    <SelectTrigger><SelectValue placeholder="Pick a room" /></SelectTrigger>
                    <SelectContent>
                      {rooms.map((r) => (
                        <SelectItem key={r.id} value={r.id} disabled={r.status === "Maintenance"}>
                          Room {r.number} · {r.type} · ${r.price}/night
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2"><Label>Check-in</Label><Input type="date" value={draft.checkIn} onChange={(e) => setDraft({ ...draft, checkIn: e.target.value })} /></div>
                  <div className="space-y-2"><Label>Check-out</Label><Input type="date" value={draft.checkOut} onChange={(e) => setDraft({ ...draft, checkOut: e.target.value })} /></div>
                </div>
                <div className="space-y-2"><Label>Extras ($)</Label><Input type="number" value={draft.extras} onChange={(e) => setDraft({ ...draft, extras: Number(e.target.value) })} /></div>
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
                <Button onClick={submit} className="gold-gradient text-[oklch(0.15_0.01_60)]">Reserve</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="glass border-0">
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Guest</TableHead>
                <TableHead>Room</TableHead>
                <TableHead>Dates</TableHead>
                <TableHead>Nights</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visible.map((b) => {
                const g = guests.find((x) => x.id === b.guestId);
                const r = rooms.find((x) => x.id === b.roomId);
                const nights = nightsBetween(b.checkIn, b.checkOut);
                const total = bookingTotal(b, r);
                return (
                  <TableRow key={b.id}>
                    <TableCell><div className="font-medium">{g?.name ?? "—"}</div><div className="text-xs text-muted-foreground">{g?.phone}</div></TableCell>
                    <TableCell>{r ? `${r.number} · ${r.type}` : "—"}</TableCell>
                    <TableCell className="whitespace-nowrap text-sm">{b.checkIn} → {b.checkOut}</TableCell>
                    <TableCell>{nights}</TableCell>
                    <TableCell className="font-mono">${total.toLocaleString()}</TableCell>
                    <TableCell><Badge variant="outline" className={statusStyle[b.status]}>{b.status}</Badge></TableCell>
                    <TableCell className="text-right">
                      <div className="inline-flex gap-1">
                        {b.status === "Reserved" && <Button size="sm" variant="ghost" onClick={() => checkIn(b.id)}><LogIn className="h-3.5 w-3.5 mr-1" />Check in</Button>}
                        {b.status === "Checked-In" && <Button size="sm" variant="ghost" onClick={() => checkOut(b.id)}><LogOut className="h-3.5 w-3.5 mr-1" />Check out</Button>}
                        {(b.status === "Reserved" || b.status === "Checked-In") && (
                          <Button size="sm" variant="ghost" onClick={() => r && cancel(b.id, r.id)} aria-label="Cancel"><X className="h-4 w-4 text-destructive" /></Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              {visible.length === 0 && (
                <TableRow><TableCell colSpan={7} className="py-12 text-center text-muted-foreground">No bookings match this filter</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
