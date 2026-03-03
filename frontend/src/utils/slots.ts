import { DateTime } from "luxon";

export function buildSlotKey(
  day: Date,
  hour: number,
  timezone: string,
): string {
  const dt = DateTime.fromJSDate(day).setZone(timezone);
  return dt.set({ hour, minute: 0, second: 0 }).toFormat("yyyy-MM-dd'T'HH:mm");
}
