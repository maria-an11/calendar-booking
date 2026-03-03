import { formatSlotInZone } from "../utils/timezone";

type ConfirmationProps = {
  slot: string;
  timezone: string;
  name: string;
  email: string;
  onBack: () => void;
};

export default function Confirmation({
  slot,
  timezone,
  name,
  email,
  onBack,
}: ConfirmationProps) {
  const slotLabel = formatSlotInZone(slot, timezone, "EEEE, d MMM 'at' HH:mm");

  return (
    <section className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm text-center">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
        <svg
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>
      <h2 className="text-xl font-semibold text-slate-800">You're booked!</h2>
      <p className="mt-2 text-slate-600">
        A confirmation would be sent to your email in a real app.
      </p>

      <div className="mt-6 rounded-xl bg-slate-50 p-4 text-left">
        <p className="text-sm font-medium text-slate-500">Meeting</p>
        <p className="mt-1 font-medium text-slate-800">{slotLabel}</p>
        <p className="mt-2 text-sm text-slate-600">{name}</p>
        <p className="text-sm text-slate-600">{email}</p>
      </div>

      <button
        type="button"
        onClick={onBack}
        className="mt-6 rounded-lg bg-slate-800 px-6 py-2.5 text-sm font-medium text-white hover:bg-slate-700"
      >
        Back to Set availability
      </button>
    </section>
  );
}
