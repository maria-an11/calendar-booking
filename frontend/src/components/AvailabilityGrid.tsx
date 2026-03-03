import { format } from "date-fns";
import { buildSlotKey } from "../utils/slots";

type Mode = "set" | "book";

type AvailabilityGridProps = {
  days: Date[];
  hours: number[];
  timezone: string;
  availableSlots: string[];
  bookedSlots: string[];
  mode: Mode;
  onToggle?: (slotKey: string) => void;
  onSelectSlot?: (slotKey: string) => void;
};

export function AvailabilityGrid({
  days,
  hours,
  timezone,
  availableSlots,
  bookedSlots,
  mode,
  onToggle,
  onSelectSlot,
}: AvailabilityGridProps) {
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full min-w-[360px] border-collapse rounded-xl border border-slate-200 bg-white shadow-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50/80">
            <th className="w-16 px-2 py-2 text-left text-[10px] font-medium text-slate-500 sm:text-xs">
              Time
            </th>
            {days.map((day) => (
              <th
                key={day.toISOString()}
                className="px-2 py-2 text-center text-[10px] font-medium text-slate-600 sm:text-xs"
              >
                {format(day, "EEE d MMM")}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {hours.map((hour) => (
            <tr key={hour} className="border-b border-slate-100 last:border-0">
              <td className="px-2 py-2 text-[10px] text-slate-500 sm:text-xs">
                {hour}:00
              </td>
              {days.map((day) => {
                const slotKey = buildSlotKey(day, hour, timezone);
                const available = availableSlots.includes(slotKey);
                const booked = bookedSlots.includes(slotKey);
                const disabled = mode === "book" && (booked || !available);

                const handleClick = () => {
                  if (mode === "book" && !disabled && onSelectSlot) {
                    onSelectSlot(slotKey);
                  } else if (mode === "set" && onToggle) {
                    onToggle(slotKey);
                  }
                };

                return (
                  <td key={slotKey} className="px-1 py-1">
                    <button
                      type="button"
                      onClick={handleClick}
                      disabled={disabled}
                      className={`
                          w-full rounded-lg py-1.5 text-xs font-medium transition sm:py-2 sm:text-sm
                          ${
                            mode === "set"
                              ? available
                                ? "bg-emerald-500/20 text-emerald-800 hover:bg-emerald-500/30"
                                : "bg-slate-100 text-slate-400 hover:bg-slate-200"
                              : disabled
                                ? "cursor-not-allowed bg-slate-100 text-slate-400"
                                : "bg-emerald-500/20 text-emerald-800 hover:bg-emerald-500/30"
                          }
                        `}
                    >
                      {booked
                        ? "Booked"
                        : available
                          ? mode === "set"
                            ? "On"
                            : "Pick"
                          : "—"}
                    </button>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
