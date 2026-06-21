import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  seedBookings,
  seedGuests,
  seedRooms,
  type Booking,
  type Guest,
  type Room,
} from "./hotel-data";

const STORAGE_KEY = "aurelia.hotel.v1";

interface State {
  rooms: Room[];
  guests: Guest[];
  bookings: Booking[];
}

interface HotelContextValue extends State {
  addRoom: (r: Omit<Room, "id">) => void;
  updateRoom: (id: string, patch: Partial<Room>) => void;
  deleteRoom: (id: string) => void;
  addGuest: (g: Omit<Guest, "id">) => Guest;
  deleteGuest: (id: string) => void;
  addBooking: (b: Omit<Booking, "id" | "status" | "payment" | "extras"> & { extras?: number }) => { ok: boolean; error?: string; booking?: Booking };
  setBookingStatus: (id: string, status: Booking["status"]) => void;
  setPayment: (id: string, payment: Booking["payment"]) => void;
  reset: () => void;
}

const HotelContext = createContext<HotelContextValue | null>(null);

function isOverlap(aIn: string, aOut: string, bIn: string, bOut: string) {
  return aIn < bOut && bIn < aOut;
}

function genId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

export function HotelProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(() => {
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) return JSON.parse(raw) as State;
      } catch {/* noop */}
    }
    return { rooms: seedRooms, guests: seedGuests, bookings: seedBookings };
  });

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {/* noop */}
  }, [state]);

  const value: HotelContextValue = useMemo(() => ({
    ...state,
    addRoom: (r) => setState((s) => ({ ...s, rooms: [...s.rooms, { ...r, id: genId("r") }] })),
    updateRoom: (id, patch) => setState((s) => ({ ...s, rooms: s.rooms.map((r) => r.id === id ? { ...r, ...patch } : r) })),
    deleteRoom: (id) => setState((s) => ({ ...s, rooms: s.rooms.filter((r) => r.id !== id) })),
    addGuest: (g) => {
      const guest = { ...g, id: genId("g") };
      setState((s) => ({ ...s, guests: [...s.guests, guest] }));
      return guest;
    },
    deleteGuest: (id) => setState((s) => ({ ...s, guests: s.guests.filter((g) => g.id !== id) })),
    addBooking: (b) => {
      if (b.checkIn >= b.checkOut) return { ok: false, error: "Check-out must be after check-in" };
      const conflict = state.bookings.find((x) =>
        x.roomId === b.roomId &&
        x.status !== "Cancelled" && x.status !== "Checked-Out" &&
        isOverlap(b.checkIn, b.checkOut, x.checkIn, x.checkOut)
      );
      if (conflict) return { ok: false, error: "Room is already booked for that range" };
      const booking: Booking = {
        id: genId("b"),
        guestId: b.guestId,
        roomId: b.roomId,
        checkIn: b.checkIn,
        checkOut: b.checkOut,
        status: "Reserved",
        payment: "Pending",
        extras: b.extras ?? 0,
      };
      setState((s) => ({ ...s, bookings: [booking, ...s.bookings] }));
      return { ok: true, booking };
    },
    setBookingStatus: (id, status) => setState((s) => {
      const bookings = s.bookings.map((b) => b.id === id ? { ...b, status } : b);
      let rooms = s.rooms;
      const target = bookings.find((b) => b.id === id);
      if (target) {
        if (status === "Checked-In") rooms = rooms.map((r) => r.id === target.roomId ? { ...r, status: "Occupied" } : r);
        if (status === "Checked-Out" || status === "Cancelled") rooms = rooms.map((r) => r.id === target.roomId ? { ...r, status: "Available" } : r);
      }
      return { ...s, bookings, rooms };
    }),
    setPayment: (id, payment) => setState((s) => ({ ...s, bookings: s.bookings.map((b) => b.id === id ? { ...b, payment } : b) })),
    reset: () => setState({ rooms: seedRooms, guests: seedGuests, bookings: seedBookings }),
  }), [state]);

  return <HotelContext.Provider value={value}>{children}</HotelContext.Provider>;
}

export function useHotel() {
  const ctx = useContext(HotelContext);
  if (!ctx) throw new Error("useHotel must be used inside HotelProvider");
  return ctx;
}

export function nightsBetween(a: string, b: string) {
  const d1 = new Date(a).getTime();
  const d2 = new Date(b).getTime();
  return Math.max(1, Math.round((d2 - d1) / (1000 * 60 * 60 * 24)));
}

export function bookingTotal(booking: Booking, room: Room | undefined) {
  if (!room) return 0;
  return nightsBetween(booking.checkIn, booking.checkOut) * room.price + booking.extras;
}
