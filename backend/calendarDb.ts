import Database from "better-sqlite3";

const db = new Database("calendar.db");
db.pragma("journal_mode = WAL");

db.exec(`
      CREATE TABLE IF NOT EXISTS availability (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slot TEXT NOT NULL UNIQUE,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slot TEXT NOT NULL,
    guest_name TEXT NOT NULL,
    guest_email TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
    `);

export function getAvailabilitySlots(): string[] {
  const rows = db
    .prepare<
      [],
      { slot: string }
    >("SELECT slot FROM availability ORDER BY slot")
    .all();
  return rows.map((row) => row.slot);
}

export function replaceAvailabilitySlots(slots: string[]): void {
  const deleteStmt = db.prepare("DELETE from availability");
  const insertStmt = db.prepare("INSERT INTO availability (slot) VALUES (?)");

  const tx = db.transaction((values: string[]) => {
    deleteStmt.run();
    for (const slot of values) {
      insertStmt.run(slot);
    }
  });

  tx(slots);
}

export type DbBooking = {
  id: number;
  slot: string;
  guest_name: string;
  guest_email: string;
  created_at: string;
};

export function getAllBookings(): DbBooking[] {
  return db
    .prepare<
      [],
      DbBooking
    >("SELECT id, slot, guest_name, guest_email, created_at FROM bookings ORDER BY created_at DESC")
    .all();
}

export function createBooking(
  slot: string,
  guestName: string,
  guestEmail: string,
): DbBooking {
  const stmt = db.prepare(
    "INSERT INTO bookings (slot, guest_name, guest_email) VALUES (?, ?, ?)",
  );

  const result = stmt.run(slot, guestName, guestEmail);

  const selectStmt = db.prepare<[number], DbBooking>(
    "SELECT id, slot, guest_name, guest_email, created_at FROM bookings WHERE id = ?",
  );
  const booking = selectStmt.get(Number(result.lastInsertRowid));

  if (!booking) {
    throw new Error("Booking not found");
  }

  return booking;
}
