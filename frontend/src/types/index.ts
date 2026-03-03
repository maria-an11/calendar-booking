export interface Booking {
  id: string;
  slot: string;
  guestName: string;
  guestEmail: string;
  createdAt: string;
}

export interface Availability {
  id: string;
  slot: string;
  createdAt: string;
}
