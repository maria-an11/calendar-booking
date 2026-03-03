import express, { Request, Response } from "express";
import cors from "cors";

import {
  getAvailabilitySlots,
  replaceAvailabilitySlots,
  getAllBookings,
  createBooking,
  type DbBooking,
} from "./calendarDb";
import {
  toUTC,
  isValidUTCSlot,
  fromUTCToZone,
  isUTCSlotInDateRange,
} from "./slots";
import { sendBookingConfirmation } from "./email";

const app = express();
const PORT = 3001;

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Calendar Booking API" });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

app.get("/api/availability", (req: Request, res: Response) => {
  const timezone = (req.query.timezone as string) ?? "UTC";
  const from = req.query.from as string | undefined;
  const to = req.query.to as string | undefined;

  const utcSlots = getAvailabilitySlots();
  const filteredUtcSlots = utcSlots.filter((slot: string) =>
    isUTCSlotInDateRange(slot, timezone, from, to),
  );

  const slots = filteredUtcSlots.map((slot: string) =>
    fromUTCToZone(slot, timezone),
  );
  res.json({ slots });
});

app.put("/api/availability", (req: Request, res: Response) => {
  const slots: string[] = req.body.slots ?? [];
  const timezone: string = req.body.timezone ?? "UTC";

  const utcSlots = slots.map((slot) => toUTC(slot, timezone));
  replaceAvailabilitySlots(utcSlots);

  res.json({ message: "Availability updated" });
});

app.post("/api/bookings", (req: Request, res: Response) => {
  const { slot, guestName, guestEmail, timezone } = req.body;

  if (!isValidUTCSlot(slot)) {
    return res.status(400).json({
      error:
        "Invalid slot: must be a UTC ISO string (e.g. 2025-02-18T09:00:00.000Z)",
    });
  }

  const availabilitySlots = getAvailabilitySlots();
  if (!availabilitySlots.includes(slot)) {
    return res.status(400).json({ error: "Slot not available" });
  }

  const existing = getAllBookings().some((b: DbBooking) => b.slot === slot);

  if (existing) {
    return res.status(400).json({ error: "Slot not available" });
  }

  const dbBooking = createBooking(slot, guestName, guestEmail);

  try {
    sendBookingConfirmation(guestEmail, guestName, slot, timezone ?? "UTC");
  } catch (err) {
    console.error("[email] Confirmation failed:", err);
  }

  const booking = {
    id: dbBooking.id.toString(),
    slot: dbBooking.slot,
    guestName: dbBooking.guest_name,
    guestEmail: dbBooking.guest_email,
    createdAt: dbBooking.created_at,
  };

  return res.status(201).json({ booking });
});

app.get("/api/bookings", (req: Request, res: Response) => {
  const rows = getAllBookings();
  const bookings = rows.map((b: DbBooking) => ({
    id: b.id,
    slot: b.slot,
    guestName: b.guest_name,
    guestEmail: b.guest_email,
    createdAt: b.created_at,
  }));

  res.json({ bookings });
});
