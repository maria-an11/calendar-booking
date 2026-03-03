import { DateTime } from "luxon";
import { useState } from "react";

type BookingFlowProps = {
  slot: string;
  timezone: string;
  onSubmit: (name: string, email: string) => void | Promise<void>;
  onBack: () => void;
};

export function BookingFlow({
  slot,
  timezone,
  onSubmit,
  onBack,
}: BookingFlowProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const slotLabel = DateTime.fromISO(slot, { zone: timezone }).toFormat(
    "EEEE, d MMM 'at' HH:mm",
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    onSubmit(name.trim(), email.trim());
  };

  return (
    <section className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <button
        type="button"
        onClick={onBack}
        className="mb-4 text-sm font-medium text-slate-500 hover:text-slate-700"
      >
        ← Back to calendar
      </button>

      <p className="mb-2 text-sm text-slate-500">You're booking</p>
      <p className="mb-6 text-lg font-semibold text-slate-800">{slotLabel}</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="name"
            className="mb-1 block text-sm font-medium text-slate-700"
          >
            Name
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            required
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800 placeholder-slate-400 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
          />
        </div>
        <div>
          <label
            htmlFor="email"
            className="mb-1 block text-sm font-medium text-slate-700"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800 placeholder-slate-400 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
          />
        </div>
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onBack}
            className="flex-1 rounded-lg border border-slate-300 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 rounded-lg bg-slate-800 py-2.5 text-sm font-medium text-white hover:bg-slate-700"
          >
            Confirm booking
          </button>
        </div>
      </form>
    </section>
  );
}
