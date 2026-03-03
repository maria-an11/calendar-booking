import { DateTime } from "luxon";

type SendEmailPayload = {
  to: string;
  subject: string;
  body: string;
};

function formatSlotForEmail(slotUTC: string, timezone: string): string {
  const dt = DateTime.fromISO(slotUTC, { zone: "utc" });
  if (!dt.isValid) return slotUTC;
  return dt.setZone(timezone).toFormat("EEEE, d MMMM 'at' HH:mm");
}

export function sendBookingConfirmation(
  guestEmail: string,
  guestName: string,
  slotUTC: string,
  timezone: string = "UTC",
): void {
  const timeFormatted = formatSlotForEmail(slotUTC, timezone);
  const payload: SendEmailPayload = {
    to: guestEmail,
    subject: "Booking confirmed",
    body: `Hi ${guestName},\n\nYour meeting is confirmed for ${timeFormatted}.\n\nSee you then!`,
  };

  if (process.env.EMAIL_API_KEY) {
    // Real provider would go here (Resend, SendGrid, etc.)
    console.log("[email] Would send:", payload);
  } else {
    console.log("[email] Mock — confirmation not sent (no EMAIL_API_KEY):", payload);
  }
}
