export type RoomType = "Single" | "Double" | "Deluxe" | "Suite";
export type RoomStatus = "Available" | "Occupied" | "Maintenance";

export interface Room {
  id: string;
  number: string;
  type: RoomType;
  price: number;
  status: RoomStatus;
  floor: number;
}

export interface Guest {
  id: string;
  name: string;
  phone: string;
  email: string;
  idProof: string;
  address: string;
}

export type BookingStatus = "Reserved" | "Checked-In" | "Checked-Out" | "Cancelled";
export type PaymentStatus = "Paid" | "Pending";

export interface Booking {
  id: string;
  guestId: string;
  roomId: string;
  checkIn: string; // ISO date
  checkOut: string;
  status: BookingStatus;
  payment: PaymentStatus;
  extras: number;
}

export const seedRooms: Room[] = [
  { id: "r1", number: "101", type: "Single", price: 120, status: "Available", floor: 1 },
  { id: "r2", number: "102", type: "Single", price: 120, status: "Occupied", floor: 1 },
  { id: "r3", number: "201", type: "Double", price: 180, status: "Available", floor: 2 },
  { id: "r4", number: "202", type: "Double", price: 180, status: "Maintenance", floor: 2 },
  { id: "r5", number: "301", type: "Deluxe", price: 280, status: "Occupied", floor: 3 },
  { id: "r6", number: "302", type: "Deluxe", price: 280, status: "Available", floor: 3 },
  { id: "r7", number: "401", type: "Suite", price: 520, status: "Occupied", floor: 4 },
  { id: "r8", number: "402", type: "Suite", price: 520, status: "Available", floor: 4 },
  { id: "r9", number: "403", type: "Suite", price: 580, status: "Available", floor: 4 },
  { id: "r10", number: "103", type: "Single", price: 130, status: "Available", floor: 1 },
];

export const seedGuests: Guest[] = [
  { id: "g1", name: "Amelia Laurent", phone: "+1 415 555 0143", email: "amelia@example.com", idProof: "PA-882134", address: "21 Marina Blvd, San Francisco" },
  { id: "g2", name: "Rohan Mehta", phone: "+91 98200 11234", email: "rohan.m@example.com", idProof: "AAD-2210-9981", address: "Bandra West, Mumbai" },
  { id: "g3", name: "Sophie Dubois", phone: "+33 6 12 34 56 78", email: "sophie.d@example.com", idProof: "FR-PASS-44219", address: "14 Rue de Rivoli, Paris" },
  { id: "g4", name: "Kenji Watanabe", phone: "+81 90 1234 5678", email: "kenji.w@example.com", idProof: "JP-INZ-77821", address: "Shibuya, Tokyo" },
  { id: "g5", name: "Isabella Romano", phone: "+39 333 998 2211", email: "isabella.r@example.com", idProof: "IT-CI-552188", address: "Via del Corso, Rome" },
];

const today = new Date();
const iso = (offsetDays: number) => {
  const d = new Date(today);
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
};

export const seedBookings: Booking[] = [
  { id: "b1", guestId: "g1", roomId: "r2", checkIn: iso(-1), checkOut: iso(2), status: "Checked-In", payment: "Pending", extras: 45 },
  { id: "b2", guestId: "g2", roomId: "r5", checkIn: iso(0), checkOut: iso(3), status: "Checked-In", payment: "Paid", extras: 120 },
  { id: "b3", guestId: "g3", roomId: "r7", checkIn: iso(-2), checkOut: iso(1), status: "Checked-In", payment: "Paid", extras: 230 },
  { id: "b4", guestId: "g4", roomId: "r3", checkIn: iso(4), checkOut: iso(7), status: "Reserved", payment: "Pending", extras: 0 },
  { id: "b5", guestId: "g5", roomId: "r9", checkIn: iso(-5), checkOut: iso(-1), status: "Checked-Out", payment: "Paid", extras: 310 },
];

export const HOTEL_NAME = "The Monarch Royale";
