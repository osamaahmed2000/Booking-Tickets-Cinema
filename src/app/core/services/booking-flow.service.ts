import { Injectable, signal } from '@angular/core';
import type { PaymentMethod, Showtime } from '../models';

export interface PendingSelection {
  showtimeId: string;
  seats: string[];
  promo: string;
}

@Injectable({ providedIn: 'root' })
export class BookingFlowService {
  readonly selection = signal<PendingSelection>({ showtimeId: '', seats: [], promo: '' });
  readonly showtime = signal<Showtime | null>(null);
  readonly payment = signal<PaymentMethod>('card');

  private readonly REGISTER = new Map([
    ['CINEMA10', 0.1],
    ['PREMIUM15', 0.15],
  ]);

  setShowtime(st: Showtime): void {
    this.showtime.set(st);
    this.selection.update((s) => ({ ...s, showtimeId: st.id }));
  }

  toggleSeat(code: string): string[] {
    const seats = this.selection().seats;
    const next = seats.includes(code) ? seats.filter((x) => x !== code) : [...seats, code];
    this.selection.update((s) => ({ ...s, seats: next }));
    return next;
  }

  clearSeats(): void {
    this.selection.update((s) => ({ ...s, seats: [] }));
  }

  setPromo(code: string): void {
    this.selection.update((s) => ({ ...s, promo: code.toUpperCase().trim() }));
  }

  discountRate(promo: string): number {
    return this.REGISTER.get(promo.toUpperCase().trim()) ?? 0;
  }

  validPromo(promo: string): boolean {
    return this.REGISTER.has(promo.toUpperCase().trim());
  }

  reset(): void {
    this.selection.set({ showtimeId: '', seats: [], promo: '' });
    this.showtime.set(null);
    this.payment.set('card');
  }
}