import type { CinemaHall, SeatInfo, Showtime } from './models';

export const ROW_LABELS = 'ABCDEFGHIJKLMNOPQRST';

export function seatLabels(hall: CinemaHall): SeatInfo[] {
  const vipStart = Math.max(0, hall.rows - hall.vipRows);
  const list: SeatInfo[] = [];
  for (let r = 0; r < hall.rows; r++) {
    const row = ROW_LABELS[r];
    const isVip = r >= vipStart;
    for (let c = 1; c <= hall.seatsPerRow; c++) {
      list.push({ code: `${row}${c}`, row, col: c, isVip });
    }
  }
  return list;
}

export function isAisle(hall: CinemaHall, col: number): boolean {
  return hall.aislesAfter.some((a) => col === a);
}

export function parseSeat(code: string): { row: string; col: number } | null {
  const m = /^([A-Z]+)(\d+)$/.exec(code);
  if (!m) return null;
  return { row: m[1], col: Number(m[2]) };
}

export function seatPrice(hall: CinemaHall, seatCode: string, st: Showtime): number {
  const vipStart = Math.max(0, hall.rows - hall.vipRows);
  const info = parseSeat(seatCode);
  if (!info) return st.price;
  const rowIdx = ROW_LABELS.indexOf(info.row);
  return rowIdx >= vipStart ? st.vipPrice : st.price;
}

export function bookingTotals(
  hall: CinemaHall,
  st: Showtime,
  seats: string[],
  discountRate: number,
): { subtotal: number; discount: number; total: number } {
  const subtotal = seats.reduce((sum, code) => sum + seatPrice(hall, code, st), 0);
  const discount = Math.round(subtotal * discountRate);
  const total = Math.max(0, subtotal - discount);
  return { subtotal, discount, total };
}

export function formatCodeSeats(seats: string[]): string {
  return seats.join(', ');
}

export function makeBookingCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return `NX-${code}`;
}

export function makeId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}${Math.floor(Math.random() * 1e6).toString(36)}`;
}

export function hashString(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}