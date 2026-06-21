import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus, Search, Trash2, Mail, Phone, IdCard } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { useHotel } from "@/lib/hotel-store";
import { HOTEL_NAME, type Guest } from "@/lib/hotel-data";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/guests")({
  head: () => ({ meta: [{ title: `Guests — ${HOTEL_NAME}` }] }),
  component: GuestsPage,
});

function empty(): Omit<Guest, "id"> { return { name: "", phone: "", email: "", idProof: "", address: "" }; }

function GuestsPage() {
  const { guests, bookings, addGuest, deleteGuest } = useHotel();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Omit<Guest, "id">>(empty());

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return guests;
    return guests.filter((g) => [g.name, g.phone, g.email, g.idProof].some((v) => v.toLowerCase().includes(q)));
  }, [guests, query]);

  function submit() {
    if (!draft.name.trim()) return toast.error("Name is required");
    addGuest(draft);
    toast.success("Guest added");
    setDraft(empty());
    setOpen(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl">Guests</h1>
          <p className="mt-1 text-sm text-muted-foreground">{guests.length} profiles on file</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search guests" className="pl-9 bg-card/40 w-64" />
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gold-gradient text-[oklch(0.15_0.01_60)] hover:opacity-95"><Plus className="mr-1 h-4 w-4" /> Add guest</Button>
            </DialogTrigger>
            <DialogContent className="glass border-0 sm:max-w-md">
              <DialogHeader><DialogTitle className="font-display">New guest</DialogTitle></DialogHeader>
              <div className="grid gap-3 py-2">
                <div className="space-y-2"><Label>Full name</Label><Input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2"><Label>Phone</Label><Input value={draft.phone} onChange={(e) => setDraft({ ...draft, phone: e.target.value })} /></div>
                  <div className="space-y-2"><Label>Email</Label><Input type="email" value={draft.email} onChange={(e) => setDraft({ ...draft, email: e.target.value })} /></div>
                </div>
                <div className="space-y-2"><Label>ID proof</Label><Input value={draft.idProof} onChange={(e) => setDraft({ ...draft, idProof: e.target.value })} /></div>
                <div className="space-y-2"><Label>Address</Label><Textarea value={draft.address} onChange={(e) => setDraft({ ...draft, address: e.target.value })} /></div>
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
                <Button onClick={submit} className="gold-gradient text-[oklch(0.15_0.01_60)]">Create</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {list.map((g) => {
          const stays = bookings.filter((b) => b.guestId === g.id).length;
          return (
            <Card key={g.id} className="glass border-0">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full gold-gradient text-base font-semibold text-[oklch(0.15_0.01_60)]">
                      {g.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <div className="truncate font-medium">{g.name}</div>
                      <div className="text-xs text-muted-foreground">{stays} stay{stays === 1 ? "" : "s"}</div>
                    </div>
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => { deleteGuest(g.id); toast.success("Guest removed"); }}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
                <div className="mt-4 space-y-1.5 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2"><Phone className="h-3.5 w-3.5 text-[var(--gold)]" /> {g.phone || "—"}</div>
                  <div className="flex items-center gap-2"><Mail className="h-3.5 w-3.5 text-[var(--gold)]" /> {g.email || "—"}</div>
                  <div className="flex items-center gap-2"><IdCard className="h-3.5 w-3.5 text-[var(--gold)]" /> {g.idProof || "—"}</div>
                </div>
                {g.address && <p className="mt-3 text-xs leading-relaxed text-muted-foreground line-clamp-2">{g.address}</p>}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
