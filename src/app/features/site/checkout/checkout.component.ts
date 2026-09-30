import { ChangeDetectionStrategy, Component, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { DataService } from '../../../core/services/data.service';
import { I18nService } from '../../../core/i18n/i18n.service';
import { BookingFlowService } from '../../../core/services/booking-flow.service';
import { ToastService } from '../../../core/services/toast.service';
import { StorageService } from '../../../core/services/storage.service';
import type { Booking, PaymentMethod, Showtime, CinemaHall, Movie } from '../../../core/models';
import { bookingTotals, makeBookingCode, makeId } from '../../../core/utils';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { LocalizePipe } from '../../../shared/pipes/localize.pipe';
import { DayPipe, ClockPipe } from '../../../shared/pipes/date.pipe';
import { MoneyPipe } from '../../../shared/pipes/money.pipe';

const MYREFS = 'noir:myrefs';

@Component({
  selector: 'page-checkout',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, TranslatePipe, LocalizePipe, DayPipe, ClockPipe, MoneyPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.scss',
  host: { class: 'page-checkout' },
})
export class CheckoutComponent implements OnInit {
  readonly promoInput = signal('');
  readonly promoError = signal(false);
  readonly form!: FormGroup;

  private payMethod: PaymentMethod = 'card';

  constructor(
    private fb: FormBuilder,
    private data: DataService,
    private i18n: I18nService,
    private flow: BookingFlowService,
    private toast: ToastService,
    private storage: StorageService,
    private router: Router,
  ) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      phone: ['', [Validators.required, Validators.pattern(/^[+\d][\d\s\-()]{7,19}$/)]],
      email: ['', [Validators.required, Validators.email]],
      card: [''],
      cardName: [''],
      exp: [''],
      cvv: [''],
      agree: [false, Validators.requiredTrue],
    });
  }

  ngOnInit(): void {
    this.flow.payment.set('card');
    if (!this.showtime() || this.seats().length === 0) {
      return;
    }
  }

  f(key: string) {
    return this.form.get(key)!;
  }

  onPromo(e: Event): void {
    this.promoInput.set((e.target as HTMLInputElement).value);
  }

  payment(): PaymentMethod {
    return this.payMethod;
  }

  setPayment(p: PaymentMethod): void {
    this.payMethod = p;
    this.flow.payment.set(p);
    const cardReqs = ['card', 'cardName', 'exp', 'cvv'];
    for (const k of cardReqs) {
      const c = this.form.get(k)!;
      if (p === 'card') {
        c.setValidators(k === 'card' ? [Validators.required] : k === 'cvv' ? [Validators.required] : []);
      } else {
        c.clearValidators();
      }
      c.updateValueAndValidity();
    }
  }

  get methods() {
    const wallet = this.i18n.t('CO_PAY_WALLET');
    return [
      { key: 'card' as const, label: this.i18n.t('CO_PAY_CARD'), icon: '<rect x="2" y="5" width="20" height="14" rx="3"/><path d="M2 10h20M6 15h4"/>' },
      { key: 'wallet' as const, label: wallet, icon: '<rect x="2.5" y="6" width="19" height="13" rx="3"/><path d="M16 12h3.5M21.5 15V9.5" stroke-linejoin="round"/>' },
      { key: 'paylater' as const, label: this.i18n.t('CO_PAY_LATER'), icon: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.2 2"/>' },
    ];
  }

  promoApplied(): boolean {
    return this.flow.selection().promo !== '' && this.flow.validPromo(this.flow.selection().promo);
  }

  promoRate(): number {
    return this.flow.discountRate(this.flow.selection().promo);
  }

  showtime(): Showtime | null {
    return this.flow.showtime();
  }

  seats(): string[] {
    return this.flow.selection().seats;
  }

  hallOf(st: Showtime): CinemaHall | undefined {
    return this.data.halls().find((h) => h.id === st.hallId);
  }

  movieOf(st: Showtime): Movie | undefined {
    return this.data.movies().find((m) => m.id === st.movieId);
  }

  movieTitle(st: Showtime): string {
    return this.movieOf(st)?.title[this.i18n.lang()] ?? '';
  }

  seatPrice(st: Showtime, code: string): number {
    const hall = this.hallOf(st);
    if (!hall) return st.price;
    const m = /^([A-Z]+)(\d+)$/.exec(code);
    const vipStart = Math.max(0, hall.rows - hall.vipRows);
    const idx = m ? m[1].charCodeAt(0) - 65 : 0;
    return idx >= vipStart ? st.vipPrice : st.price;
  }

  get totals() {
    const st = this.showtime();
    const hall = st ? this.hallOf(st) : undefined;
    if (!st || !hall) return { subtotal: 0, discount: 0, total: 0 };
    return bookingTotals(hall, st, this.seats(), this.promoApplied() ? this.promoRate() : 0);
  }

  applyPromo(): void {
    const code = this.promoInput().trim();
    if (this.flow.validPromo(code)) {
      this.flow.setPromo(code);
      this.promoError.set(false);
    } else {
      this.promoError.set(true);
    }
  }

  formatCard(e: Event): void {
    const el = e.target as HTMLInputElement;
    el.value = el.value.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
  }

  formatExp(e: Event): void {
    const el = e.target as HTMLInputElement;
    const d = el.value.replace(/\D/g, '').slice(0, 4);
    el.value = d.length > 2 ? `${d.slice(0, 2)} / ${d.slice(2)}` : d;
  }

  submit(): void {
    if (this.form.invalid || !this.showtime() || this.seats().length === 0) return;
    const st = this.showtime()!;
    const movie = this.movieOf(st);
    const booking: Booking = {
      id: makeId('bk'),
      code: makeBookingCode(),
      showtimeId: st.id,
      movieId: st.movieId,
      seats: [...this.seats()].sort(),
      subtotal: this.totals.subtotal,
      discount: this.totals.discount,
      total: this.totals.total,
      promo: this.flow.selection().promo || undefined,
      customer: {
        name: this.form.value.name!.trim(),
        email: this.form.value.email!.trim(),
        phone: this.form.value.phone!.trim(),
      },
      payment: this.payMethod,
      status: 'confirmed',
      createdAt: new Date().toISOString(),
    };
    this.data.addBooking(booking);
    const refs = this.storage.get<string[]>(MYREFS) ?? [];
    refs.unshift(booking.code);
    this.storage.set(MYREFS, refs.slice(0, 50));
    this.toast.ok(this.i18n.t('TOAST_SEATS_RESERVED', { code: booking.code }));
    this.flow.reset();
    this.router.navigate(['/confirmation', booking.code]);
  }
}