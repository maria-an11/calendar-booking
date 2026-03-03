import type { Booking } from "./types";

const API_URL = "http://localhost:3001";

async function fetchAPI<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ error: "Unknown error" }));
    throw new Error(error.error || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

export const api = {
  getAvailability: async (
    from: string,
    to: string,
    timezone: string,
  ): Promise<string[]> => {
    const params = new URLSearchParams({ from, to, timezone });
    const data = await fetchAPI<{ slots: string[] }>(
      `/api/availability?${params}`,
    );
    return data.slots;
  },

  putAvailability: async (
    slots: string[],
    timezone: string,
  ): Promise<{ message: string }> => {
    return fetchAPI<{ message: string }>("/api/availability", {
      method: "PUT",
      body: JSON.stringify({ slots, timezone }),
    });
  },

  getBookings: async (): Promise<Booking[]> => {
    const data = await fetchAPI<{ bookings: Booking[] }>("/api/bookings");
    return data.bookings;
  },

  postBooking: async (
    slotUTC: string,
    guestName: string,
    guestEmail: string,
    timezone?: string,
  ): Promise<Booking> => {
    const data = await fetchAPI<{ booking: Booking }>("/api/bookings", {
      method: "POST",
      body: JSON.stringify({ slot: slotUTC, guestName, guestEmail, timezone }),
    });

    return data.booking;
  },
};
