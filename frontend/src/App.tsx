import { useEffect, useState } from "react";
import { startOfWeek, addDays } from "date-fns";
import type { Booking } from "./types";
import { api } from "./api";
import { AvailabilityGrid } from "./components/AvailabilityGrid";
import { BookingFlow } from "./components/BookingFlow";
import Confirmation from "./components/Confirmation";
import {
  getUserTimezone,
  slotToUTC,
  utcToSlotInZone,
  formatSlotInZone,
  COMMON_TIMEZONES,
  getWeekDateRange,
} from "./utils/timezone";

export type View = "set" | "book" | "confirm";

const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
const HOURS = [9, 10, 11, 12, 14, 15, 16, 17];
const DAYS = [0, 1, 2, 3, 4].map((i) => addDays(weekStart, i));

function App() {
  const [view, setView] = useState<View>("book");
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [lastBooking, setLastBooking] = useState<Booking | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [timezone, setTimezone] = useState(() => getUserTimezone());

  const bookedSlots = bookings.map((b) => utcToSlotInZone(b.slot, timezone));
  const availableToBook = availableSlots.filter(
    (slot) => !bookedSlots.includes(slot),
  );

  useEffect(() => {
    if (view !== "set") return;

    const { from, to } = getWeekDateRange(weekStart, DAYS.length, timezone);

    api
      .getAvailability(from, to, timezone)
      .then((slots) => {
        setAvailableSlots(slots);
      })
      .catch(console.error);
  }, [view, timezone]);

  useEffect(() => {
    if (view !== "book") return;

    async function load() {
      try {
        const { from, to } = getWeekDateRange(weekStart, DAYS.length, timezone);

        const [slots, allBookings] = await Promise.all([
          api.getAvailability(from, to, timezone),
          api.getBookings(),
        ]);

        setAvailableSlots(slots);
        setBookings(allBookings);
      } catch (err) {
        console.log(err);
      }
    }

    load();
  }, [view, timezone]);

  async function handleSubmitBooking(name: string, email: string) {
    if (!selectedSlot) return;

    try {
      const slotUTC = slotToUTC(selectedSlot, timezone);
      const booking = await api.postBooking(slotUTC, name, email, timezone);
      setBookings((prev) => [...prev, booking]);
      setLastBooking(booking);

      setSelectedSlot(null);
      setView("confirm");
    } catch (err) {
      console.error(err);
    }
  }

  function handleToggleSlot(slotKey: string) {
    setAvailableSlots((prev) => {
      const exists = prev.includes(slotKey);
      const next = exists
        ? prev.filter((s) => s !== slotKey)
        : [...prev, slotKey];

      api.putAvailability(next, timezone).catch(console.error);

      return next;
    });
  }

  function handleSelectSlot(slotKey: string) {
    if (!availableToBook.includes(slotKey)) return;
    setSelectedSlot(slotKey);
    setView("book");
  }

  return (
    <div className="min-h-screen font-sans">
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
          <h1 className="text-xl font-semibold text-slate-800">
            Calendar Booking
          </h1>
          <nav className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                setView("set");
                setSelectedSlot(null);
                setLastBooking(null);
              }}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
                view === "set"
                  ? "bg-slate-800 text-white"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              Set availability
            </button>
            <button
              type="button"
              onClick={() => {
                setView("book");
                setSelectedSlot(null);
                setLastBooking(null);
              }}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
                view === "book"
                  ? "bg-slate-800 text-white"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              Book a meeting
            </button>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8">
        <div className="mb-4 flex items-center gap-3">
          <label
            htmlFor="timezone"
            className="text-sm font-medium text-slate-600"
          >
            Time zone
          </label>
          <select
            id="timezone"
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-800 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
          >
            {COMMON_TIMEZONES.map((tz) => (
              <option key={tz} value={tz}>
                {tz}
              </option>
            ))}
            {!COMMON_TIMEZONES.includes(
              timezone as (typeof COMMON_TIMEZONES)[number],
            ) && <option value={timezone}>{timezone}</option>}
          </select>
        </div>
        {view === "set" && (
          <section>
            <p className="text-slate-600 mb-4">
              Click time slots to mark them available (green) or unavailable.
              This mimics “Set availability” in a real Calendly-style app.
            </p>
            <AvailabilityGrid
              days={DAYS}
              hours={HOURS}
              timezone={timezone}
              availableSlots={availableSlots}
              bookedSlots={[]}
              mode="set"
              onToggle={handleToggleSlot}
            />
          </section>
        )}

        {view === "book" && selectedSlot === null && (
          <section>
            <p className="text-slate-600 mb-4">
              Pick a slot to book a 30-min meeting. Slots already booked are
              disabled.
            </p>
            <AvailabilityGrid
              days={DAYS}
              hours={HOURS}
              timezone={timezone}
              availableSlots={availableToBook}
              bookedSlots={bookedSlots}
              mode="book"
              onSelectSlot={handleSelectSlot}
            />
          </section>
        )}

        {view === "book" && selectedSlot !== null && (
          <BookingFlow
            slot={selectedSlot}
            timezone={timezone}
            onSubmit={handleSubmitBooking}
            onBack={() => setSelectedSlot(null)}
          />
        )}

        {view === "book" && bookings.length > 0 && (
          <section className="mt-4">
            <h2>Upcoming bookings</h2>
            <ul>
              {bookings.map((b) => (
                <li key={b.id}>
                  {formatSlotInZone(b.slot, timezone, "EEE d MMM, HH:mm")} -{" "}
                  {b.guestName} ({b.guestEmail})
                </li>
              ))}
            </ul>
          </section>
        )}

        {view === "confirm" && lastBooking && (
          <Confirmation
            slot={lastBooking.slot}
            timezone={timezone}
            name={lastBooking.guestName}
            email={lastBooking.guestEmail}
            onBack={() => {
              setView("set");
              setLastBooking(null);
            }}
          />
        )}
      </main>
    </div>
  );
}

export default App;
