import { DateTime } from "luxon";

export function toUTC(slotLocal: string, timezone: string): string {
  const dt = DateTime.fromISO(slotLocal, { zone: timezone });
  if (!dt.isValid) {
    throw new Error(`Invalid slot or timezone: ${slotLocal} in ${timezone}`);
  }
  return dt.toUTC().toISO() ?? "";
}

export function parseUTCSlot(slot: string): DateTime {
  const dt = DateTime.fromISO(slot, { zone: "utc" });
  if (!dt.isValid) {
    throw new Error(`Invalid UTC slot: ${slot}`);
  }
  return dt;
}

export function isValidUTCSlot(slot: string): boolean {
  const dt = DateTime.fromISO(slot, { zone: "utc" });
  return dt.isValid && (slot.endsWith("Z") || slot.includes("+00:00"));
}

export function fromUTCToZone(slotUTC: string, timezone: string): string {
  const dt = DateTime.fromISO(slotUTC, { zone: "utc" });
  if (!dt.isValid) {
    throw new Error(`Invalid UTC slot: ${slotUTC}`);
  }
  const local = dt.setZone(timezone);
  return local.toFormat("yyyy-MM-dd'T'HH:mm");
}

export function isUTCSlotInDateRange(
  slotUTC: string,
  timezone: string,
  from?: string,
  to?: string,
): boolean {
  if (!from && !to) return true;

  const dt = DateTime.fromISO(slotUTC, { zone: "utc" });
  if (!dt.isValid) return false;

  const local = dt.setZone(timezone);
  const dateStr = local.toISODate();
  if (!dateStr) return false;

  if (from && dateStr < from) return false;
  if (to && dateStr > to) return false;

  return true;
}
