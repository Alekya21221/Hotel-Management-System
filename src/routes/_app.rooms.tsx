import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Trash2, BedDouble } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import { useHotel } from "@/lib/hotel-store";
import type { Room, RoomStatus, RoomType } from "@/lib/hotel-data";
import { HOTEL_NAME } from "@/lib/hotel-data";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/rooms")({
  head: () => ({ meta: [{ title: `Rooms — ${HOTEL_NAME}` }] }),
  component: RoomsPage,
});

const TYPES: RoomType[] = ["Single", "Double", "Deluxe", "Suite"];
const STATUSES: RoomStatus[] = ["Available", "Occupied", "Maintenance"];

const statusStyle: Record<RoomStatus, string> = {
  Available: "bg-[var(--success)]/15 text-[var(--success)] border-[var(--success)]/30",
  Occupied: "bg-[var(--gold)]/15 text-[var(--gold)] border-[var(--gold)]/30",
  Maintenance: "bg-muted text-muted-foreground border-border",
};

function emptyDraft(): Omit<Room, "id"> {
  return { number: "", type: "Single", price: 120, status: "Available", floor: 1 };
}

function RoomsPage() {
  const { rooms, addRoom, updateRoom, deleteRoom } = useHotel();
  const [filter, setFilter] = useState<"all" | RoomStatus>("all");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Room | null>(null);
  const [draft, setDraft] = useState<Omit<Room, "id">>(emptyDraft());

  function openCreate() { setEditing(null); setDraft(emptyDraft()); setOpen(true); }
  function openEdit(r: Room) { setEditing(r); const { id: _id, ...rest } = r; setDraft(rest); setOpen(true); }

  function submit() {
    if (!draft.number.trim()) return toast.error("Room number required");
    if (editing) {
      updateRoom(editing.id, draft);
      toast.success("Room updated");
    } else {
      addRoom(draft);
      toast.success("Room added");
    }
    setOpen(false);
  }

  const visible = rooms.filter((r) => filter === "all" || r.status === filter);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl">Rooms & Suites</h1>
          <p className="mt-1 text-sm text-muted-foreground">{rooms.length} rooms across the property</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
            <SelectTrigger className="w-44 bg-card/40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreate} className="gold-gradient text-[oklch(0.15_0.01_60)] hover:opacity-95">
                <Plus className="mr-1 h-4 w-4" /> Add room
              </Button>
            </DialogTrigger>
            <DialogContent className="glass border-0 sm:max-w-md">
              <DialogHeader><DialogTitle className="font-display">{editing ? "Edit room" : "New room"}</DialogTitle></DialogHeader>
              <div className="grid gap-4 py-2">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2"><Label>Number</Label><Input value={draft.number} onChange={(e) => setDraft({ ...draft, number: e.target.value })} /></div>
                  <div className="space-y-2"><Label>Floor</Label><Input type="number" value={draft.floor} onChange={(e) => setDraft({ ...draft, floor: Number(e.target.value) })} /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Type</Label>
                    <Select value={draft.type} onValueChange={(v) => setDraft({ ...draft, type: v as RoomType })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2"><Label>Price / night</Label><Input type="number" value={draft.price} onChange={(e) => setDraft({ ...draft, price: Number(e.target.value) })} /></div>
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={draft.status} onValueChange={(v) => setDraft({ ...draft, status: v as RoomStatus })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
                <Button onClick={submit} className="gold-gradient text-[oklch(0.15_0.01_60)]">{editing ? "Save" : "Create"}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {visible.map((r) => (
          <Card key={r.id} className="glass border-0 transition-transform hover:-translate-y-0.5 hover:shadow-2xl">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-accent/60">
                  <BedDouble className="h-5 w-5 text-[var(--gold)]" />
                </div>
                <Badge variant="outline" className={statusStyle[r.status]}>{r.status}</Badge>
              </div>
              <div className="mt-4 font-display text-2xl">Room {r.number}</div>
              <div className="text-xs text-muted-foreground">{r.type} · Floor {r.floor}</div>
              <div className="mt-3 flex items-end justify-between">
                <div>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground">Per night</div>
                  <div className="font-display text-xl text-gold-gradient">${r.price}</div>
                </div>
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" onClick={() => openEdit(r)}>Edit</Button>
                  <Button size="sm" variant="ghost" onClick={() => { deleteRoom(r.id); toast.success("Room removed"); }} aria-label="Delete">
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
