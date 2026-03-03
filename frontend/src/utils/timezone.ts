import { DateTime } from "luxon";

export function getUserTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

export function slotToUTC(slotLocal: string, timezone: string): string {
  const dt = DateTime.fromISO(slotLocal, { zone: timezone });
  if (!dt.isValid) {
    throw new Error(`Invalid slot: ${slotLocal}`);
  }
  return dt.toUTC().toISO() ?? "";
}

export function utcToSlotInZone(slotUTC: string, timezone: string): string {
  const dt = DateTime.fromISO(slotUTC, { zone: "utc" });
  if (!dt.isValid) {
    throw new Error(`Invalid UTC slot: ${slotUTC}`);
  }
  return dt.setZone(timezone).toFormat("yyyy-MM-dd'T'HH:mm");
}

export function formatSlotInZone(
  slotUTC: string,
  timezone: string,
  formatStr: string,
): string {
  const dt = DateTime.fromISO(slotUTC, { zone: "utc" });
  if (!dt.isValid) return slotUTC;
  return dt.setZone(timezone).toFormat(formatStr);
}

export const COMMON_TIMEZONES = [
  "Europe/London",
  "Europe/Paris",
  "America/New_York",
  "America/Los_Angeles",
  "Asia/Tokyo",
  "Australia/Sydney",
  "UTC",
] as const;

export function getWeekDateRange(
  weekStart: Date,
  days: number,
  timezone: string,
): { from: string; to: string } {
  const start = DateTime.fromJSDate(weekStart).setZone(timezone);
  const end = start.plus({ days: days - 1 });

  return {
    from: start.toISODate() ?? "",
    to: end.toISODate() ?? "",
  };
}
