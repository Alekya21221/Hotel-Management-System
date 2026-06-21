import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { BedDouble, CalendarPlus, CheckCircle2, Printer, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { useHotel, bookingTotal, nightsBetween } from "@/lib/hotel-store";
import { useAuth } from "@/lib/auth-store";
import { HOTEL_NAME, type Room, type BookingStatus } from "@/lib/hotel-data";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/portal")({
  head: () => ({ meta: [{ title: `My Stay — ${HOTEL_NAME}` }] }),
  component: PortalPage,
});

const statusStyle: Record<BookingStatus, string> = {
  "Reserved": "bg-[var(--warning)]/15 text-[var(--warning)] border-[var(--warning)]/30",
  "Checked-In": "bg-[var(--success)]/15 text-[var(--success)] border-[var(--success)]/30",
  "Checked-Out": "bg-muted text-muted-foreground border-border",
  "Cancelled": "bg-destructive/15 text-destructive border-destructive/30",
};

function PortalPage() {
  const { user } = useAuth();
  const { rooms, bookings, addBooking, setPayment } = useHotel();
  const guestId = user?.guestId ?? "";

  const today = new Date().toISOString().slice(0, 10);
  const tomorrow = (() => { const d = new Date(); d.setDate(d.getDate() + 1); return d.toISOString().slice(0, 10); })();

  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Room | null>(null);
  const [range, setRange] = useState({ checkIn: today, checkOut: tomorrow });

  const myBookings = useMemo(
    () => bookings.filter((b) => b.guestId === guestId),
    [bookings, guestId],
  );

  const availableRooms = rooms.filter((r) => r.status !== "Maintenance");

  function openBook(room: Room) {
    setSelected(room);
    setRange({ checkIn: today, checkOut: tomorrow });
    setOpen(true);
  }

  function confirmBooking() {
    if (!selected || !guestId) return;
    const res = addBooking({ guestId, roomId: selected.id, checkIn: range.checkIn, checkOut: range.checkOut, extras: 0 });
    if (!res.ok) return toast.error(res.error ?? "Could not book this room");
    toast.success(`Reservation confirmed for Room ${selected.number}`);
    setOpen(false);
  }

  function pay(id: string) {
    setPayment(id, "Paid");
    toast.success("Payment received. Thank you!");
  }

  function printInvoice(bookingId: string) {
    const b = bookings.find((x) => x.id === bookingId);
    if (!b) return;
    const r = rooms.find((x) => x.id === b.roomId);
    const nights = nightsBetween(b.checkIn, b.checkOut);
    const roomCharge = (r?.price ?? 0) * nights;
    const total = roomCharge + b.extras;
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>Invoice ${b.id}</title>
      <style>body{font-family:Inter,system-ui,sans-serif;color:#1a1a1a;padding:48px;max-width:780px;margin:auto}
        h1{font-family:'Playfair Display',serif;font-size:28px;margin:0;color:#8a6a1f}
        .muted{color:#666;font-size:12px}
        table{width:100%;border-collapse:collapse;margin-top:24px}
        th,td{text-align:left;padding:10px;border-bottom:1px solid #eee;font-size:14px}
        .right{text-align:right}</style></head><body>
      <h1>${HOTEL_NAME}</h1><div class="muted">Invoice ${b.id} · ${new Date().toLocaleDateString()}</div>
      <div style="margin-top:24px"><div class="muted">Billed to</div><div style="font-weight:600">${user?.name ?? ""}</div></div>
      <table><thead><tr><th>Description</th><th class="right">Qty</th><th class="right">Rate</th><th class="right">Amount</th></tr></thead>
      <tbody><tr><td>Room ${r?.number} · ${r?.type}<br/><span class="muted">${b.checkIn} → ${b.checkOut}</span></td>
        <td class="right">${nights}</td><td class="right">$${r?.price}</td><td class="right">$${roomCharge}</td></tr>
        ${b.extras ? `<tr><td>Extras</td><td class="right">—</td><td class="right">—</td><td class="right">$${b.extras}</td></tr>` : ""}
      </tbody><tfoot><tr><td colspan="3" class="right" style="font-weight:600">Total</td>
        <td class="right" style="color:#8a6a1f;font-weight:600;font-size:18px">$${total.toLocaleString()}</td></tr>
        <tr><td colspan="3" class="right muted">Status</td><td class="right">${b.payment}</td></tr></tfoot></table>
      <script>window.onload=()=>window.print()</script></body></html>`;
    const w = window.open("", "_blank");
    if (!w) return toast.error("Pop-up blocked");
    w.document.write(html); w.document.close();
  }

  return (
    <div className="space-y-8">
      <div className="glass rounded-2xl p-6 sm:p-8">
        <div className="flex items-start gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl gold-gradient text-[oklch(0.15_0.01_60)]">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-display text-3xl">Welcome, {user?.name?.split(" ")[0] ?? "guest"}.</h1>
            <p className="mt-1 text-sm text-muted-foreground">Browse our suites, reserve your stay, and settle your bill — anytime.</p>
          </div>
        </div>
      </div>

      <section>
        <div className="mb-3 flex items-end justify-between">
          <h2 className="font-display text-2xl">Available rooms</h2>
          <span className="text-xs text-muted-foreground">{availableRooms.length} suites to discover</span>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {availableRooms.map((r) => (
            <Card key={r.id} className="glass border-0 transition-transform hover:-translate-y-0.5 hover:shadow-2xl">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="grid h-12 w-12 place-items-center rounded-xl bg-accent/60">
                    <BedDouble className="h-5 w-5 text-[var(--gold)]" />
                  </div>
                  <Badge variant="outline" className="border-[var(--gold)]/40 text-[var(--gold)]">{r.type}</Badge>
                </div>
                <div className="mt-4 font-display text-2xl">Room {r.number}</div>
                <div className="text-xs text-muted-foreground">Floor {r.floor}</div>
                <div className="mt-3 flex items-end justify-between">
                  <div>
                    <div className="text-xs uppercase tracking-wider text-muted-foreground">Per night</div>
                    <div className="font-display text-xl text-gold-gradient">${r.price}</div>
                  </div>
                  <Button size="sm" onClick={() => openBook(r)} className="gold-gradient text-[oklch(0.15_0.01_60)] hover:opacity-95">
                    <CalendarPlus className="h-4 w-4 mr-1" /> Book
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-end justify-between">
          <h2 className="font-display text-2xl">My bookings & bills</h2>
          <span className="text-xs text-muted-foreground">{myBookings.length} reservation{myBookings.length === 1 ? "" : "s"}</span>
        </div>
        <Card className="glass border-0">
          <CardContent className="p-0 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Room</TableHead>
                  <TableHead>Dates</TableHead>
                  <TableHead>Nights</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {myBookings.map((b) => {
                  const r = rooms.find((x) => x.id === b.roomId);
                  const nights = nightsBetween(b.checkIn, b.checkOut);
                  const total = bookingTotal(b, r);
                  return (
                    <TableRow key={b.id}>
                      <TableCell>{r ? `${r.number} · ${r.type}` : "—"}</TableCell>
                      <TableCell className="whitespace-nowrap text-sm">{b.checkIn} → {b.checkOut}</TableCell>
                      <TableCell>{nights}</TableCell>
                      <TableCell className="font-mono">${total.toLocaleString()}</TableCell>
                      <TableCell><Badge variant="outline" className={statusStyle[b.status]}>{b.status}</Badge></TableCell>
                      <TableCell>
                        <Badge variant="outline" className={b.payment === "Paid"
                          ? "bg-[var(--success)]/15 text-[var(--success)] border-[var(--success)]/30"
                          : "bg-[var(--warning)]/15 text-[var(--warning)] border-[var(--warning)]/30"}>{b.payment}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="inline-flex gap-1">
                          {b.payment === "Pending" && (
                            <Button size="sm" onClick={() => pay(b.id)} className="gold-gradient text-[oklch(0.15_0.01_60)]">
                              <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Pay now
                            </Button>
                          )}
                          <Button size="sm" variant="ghost" onClick={() => printInvoice(b.id)}>
                            <Printer className="h-3.5 w-3.5 mr-1" /> Invoice
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {myBookings.length === 0 && (
                  <TableRow><TableCell colSpan={7} className="py-12 text-center text-muted-foreground">No reservations yet — pick a room above to begin.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </section>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="glass border-0 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">Reserve Room {selected?.number}</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="grid gap-3 py-2">
              <div className="rounded-lg border border-border/60 p-3 text-sm">
                <div className="text-muted-foreground">{selected.type} · Floor {selected.floor}</div>
                <div className="mt-1 font-display text-xl text-gold-gradient">${selected.price} <span className="text-xs text-muted-foreground">/ night</span></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2"><Label>Check-in</Label>
                  <Input type="date" value={range.checkIn} onChange={(e) => setRange({ ...range, checkIn: e.target.value })} /></div>
                <div className="space-y-2"><Label>Check-out</Label>
                  <Input type="date" value={range.checkOut} onChange={(e) => setRange({ ...range, checkOut: e.target.value })} /></div>
              </div>
              <div className="rounded-lg bg-accent/40 p-3 text-sm flex items-center justify-between">
                <span className="text-muted-foreground">{nightsBetween(range.checkIn, range.checkOut)} night(s)</span>
                <span className="font-display text-lg text-gold-gradient">
                  ${(nightsBetween(range.checkIn, range.checkOut) * selected.price).toLocaleString()}
                </span>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={confirmBooking} className="gold-gradient text-[oklch(0.15_0.01_60)]">Confirm booking</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
