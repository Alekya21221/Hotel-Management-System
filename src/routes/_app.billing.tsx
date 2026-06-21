import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { Printer, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { useHotel, bookingTotal, nightsBetween } from "@/lib/hotel-store";
import { HOTEL_NAME } from "@/lib/hotel-data";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/billing")({
  head: () => ({ meta: [{ title: `Billing — ${HOTEL_NAME}` }] }),
  component: BillingPage,
});

function BillingPage() {
  const { bookings, guests, rooms, setPayment } = useHotel();

  const totals = useMemo(() => {
    let paid = 0, pending = 0;
    bookings.forEach((b) => {
      const t = bookingTotal(b, rooms.find((r) => r.id === b.roomId));
      if (b.payment === "Paid") paid += t; else pending += t;
    });
    return { paid, pending };
  }, [bookings, rooms]);

  function printInvoice(bookingId: string) {
    const b = bookings.find((x) => x.id === bookingId);
    if (!b) return;
    const g = guests.find((x) => x.id === b.guestId);
    const r = rooms.find((x) => x.id === b.roomId);
    const nights = nightsBetween(b.checkIn, b.checkOut);
    const roomCharge = (r?.price ?? 0) * nights;
    const total = roomCharge + b.extras;

    const html = `<!doctype html><html><head><meta charset="utf-8"><title>Invoice ${b.id}</title>
      <style>
        body{font-family:Inter,system-ui,sans-serif;color:#1a1a1a;padding:48px;max-width:780px;margin:auto}
        h1{font-family:'Playfair Display',serif;font-size:28px;margin:0;color:#8a6a1f}
        .muted{color:#666;font-size:12px}
        table{width:100%;border-collapse:collapse;margin-top:24px}
        th,td{text-align:left;padding:10px;border-bottom:1px solid #eee;font-size:14px}
        tfoot td{font-weight:600}
        .right{text-align:right}
        .pill{display:inline-block;padding:4px 10px;border-radius:999px;background:#fdf4d8;color:#8a6a1f;font-size:12px;letter-spacing:.08em;text-transform:uppercase}
      </style></head><body>
      <div style="display:flex;justify-content:space-between;align-items:flex-start">
        <div><h1>${HOTEL_NAME}</h1><div class="muted">123 Grand Promenade · concierge@aurelia.example</div></div>
        <div class="right"><span class="pill">Invoice</span><div class="muted" style="margin-top:6px">${b.id}<br/>${new Date().toLocaleDateString()}</div></div>
      </div>
      <div style="margin-top:32px">
        <div class="muted">Billed to</div>
        <div style="font-size:16px;font-weight:600">${g?.name ?? "Guest"}</div>
        <div class="muted">${g?.email ?? ""} · ${g?.phone ?? ""}</div>
      </div>
      <table>
        <thead><tr><th>Description</th><th class="right">Qty</th><th class="right">Rate</th><th class="right">Amount</th></tr></thead>
        <tbody>
          <tr><td>Room ${r?.number} · ${r?.type}<br/><span class="muted">${b.checkIn} → ${b.checkOut}</span></td><td class="right">${nights} night${nights === 1 ? "" : "s"}</td><td class="right">$${r?.price ?? 0}</td><td class="right">$${roomCharge.toLocaleString()}</td></tr>
          ${b.extras ? `<tr><td>Extras & services</td><td class="right">—</td><td class="right">—</td><td class="right">$${b.extras.toLocaleString()}</td></tr>` : ""}
        </tbody>
        <tfoot>
          <tr><td colspan="3" class="right">Total</td><td class="right" style="color:#8a6a1f;font-size:18px">$${total.toLocaleString()}</td></tr>
          <tr><td colspan="3" class="right muted">Payment status</td><td class="right">${b.payment}</td></tr>
        </tfoot>
      </table>
      <p class="muted" style="margin-top:48px">Thank you for staying at ${HOTEL_NAME}.</p>
      <script>window.onload=()=>window.print()</script>
      </body></html>`;
    const w = window.open("", "_blank");
    if (!w) return toast.error("Pop-up blocked");
    w.document.write(html); w.document.close();
  }

  function markPaid(id: string) { setPayment(id, "Paid"); toast.success("Payment recorded"); }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl">Billing</h1>
          <p className="mt-1 text-sm text-muted-foreground">Invoices auto-calculated from stay duration and extras</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="glass border-0"><CardContent className="p-5">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Paid</div>
          <div className="mt-2 font-display text-3xl text-[var(--success)]">${totals.paid.toLocaleString()}</div>
        </CardContent></Card>
        <Card className="glass border-0"><CardContent className="p-5">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Pending</div>
          <div className="mt-2 font-display text-3xl text-gold-gradient">${totals.pending.toLocaleString()}</div>
        </CardContent></Card>
      </div>

      <Card className="glass border-0">
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Invoice</TableHead>
                <TableHead>Guest</TableHead>
                <TableHead>Room</TableHead>
                <TableHead>Nights</TableHead>
                <TableHead>Extras</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings.map((b) => {
                const g = guests.find((x) => x.id === b.guestId);
                const r = rooms.find((x) => x.id === b.roomId);
                const nights = nightsBetween(b.checkIn, b.checkOut);
                const total = bookingTotal(b, r);
                return (
                  <TableRow key={b.id}>
                    <TableCell className="font-mono text-xs">{b.id}</TableCell>
                    <TableCell>{g?.name ?? "—"}</TableCell>
                    <TableCell>{r ? `${r.number} · ${r.type}` : "—"}</TableCell>
                    <TableCell>{nights}</TableCell>
                    <TableCell>${b.extras.toLocaleString()}</TableCell>
                    <TableCell className="font-mono">${total.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={b.payment === "Paid"
                        ? "bg-[var(--success)]/15 text-[var(--success)] border-[var(--success)]/30"
                        : "bg-[var(--warning)]/15 text-[var(--warning)] border-[var(--warning)]/30"}>{b.payment}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="inline-flex gap-1">
                        {b.payment === "Pending" && (
                          <Button size="sm" variant="ghost" onClick={() => markPaid(b.id)}>
                            <CheckCircle2 className="h-3.5 w-3.5 mr-1 text-[var(--success)]" /> Mark paid
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
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
