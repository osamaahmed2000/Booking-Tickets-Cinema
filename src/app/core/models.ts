export type Lang = 'en' | 'ar';
export type HallKind = 'IMAX' | '3D' | '2D' | 'VIP';
export type MovieStatus = 'now' | 'soon';
export type PaymentMethod = 'card' | 'wallet' | 'paylater';
export type BookingStatus = 'confirmed' | 'cancelled';

export interface Localized {
  en: string;
  ar: string;
}

export type ArtStyle =
  | 'surge'
  | 'orbit'
  | 'monolith'
  | 'horizon'
  | 'prism'
  | 'veil'
  | 'arc'
  | 'grid'
  | 'cross'
  | 'waves';

export interface ArtConfig {
  bg: [string, string];
  accent: string;
  accent2: string;
  style: ArtStyle;
}

export interface Movie {
  id: string;
  title: Localized;
  tagline: Localized;
  overview: Localized;
  status: MovieStatus;
  year: number;
  durationMin: number;
  rating: number;
  age: string;
  genres: Localized[];
  badge?: string;
  director: Localized;
  cast: Localized[];
  art: ArtConfig;
  favorite?: boolean;
}

export interface CinemaHall {
  id: string;
  name: Localized;
  kind: HallKind;
  rows: number;
  seatsPerRow: number;
  vipRows: number;
  aislesAfter: number[];
}

export interface Showtime {
  id: string;
  movieId: string;
  hallId: string;
  dateISO: string;
  time: string;
  price: number;
  vipPrice: number;
  bookedSeats: string[];
}

export interface Customer {
  name: string;
  email: string;
  phone: string;
}

export interface Booking {
  id: string;
  code: string;
  showtimeId: string;
  movieId: string;
  seats: string[];
  subtotal: number;
  discount: number;
  total: number;
  promo?: string;
  customer: Customer;
  payment: PaymentMethod;
  status: BookingStatus;
  createdAt: string;
}

export interface Settings {
  currency: 'EGP' | 'SAR' | 'USD' | 'AED';
  cinemaName: Localized;
  email: string;
  phone: string;
  address: Localized;
}

export interface SeatInfo {
  code: string;
  row: string;
  col: number;
  isVip: boolean;
}