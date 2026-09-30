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
  template: `
    <section class="container section section--tight">
      <div class="co-head animate-in">
        <span class="kicker">{{ 'CO_LEGEND' | tr }}</span>
        <h1 class="co-title">{{ 'CO_TITLE' | tr }}</h1>
      </div>

      <div class="co-grid">
        <form class="co-left" [formGroup]="form" (ngSubmit)="submit()">
          <div class="card block">
            <div class="block__head">
              <span class="block__num">01</span>
              <h3>{{ 'CO_FORM' | tr }}</h3>
              <small>{{ 'CO_FORM_SUB' | tr }}</small>
            </div>
            <div class="block__body">
              <div class="form-row">
                <div class="field" style="min-width:0">
                  <label>{{ 'CO_NAME' | tr }}</label>
                  <input class="input" formControlName="name" [class.is-err]="f('name').invalid && f('name').touched" [attr.placeholder]="'CO_NAME' | tr" />
                  @if (f('name').invalid && f('name').touched) { <div class="form-error">{{ 'CO_VALID_REQ' | tr }}</div> }
                </div>
              </div>
              <div class="form-row">
                <div class="field" style="min-width:0">
                  <label>{{ 'CO_PHONE' | tr }}</label>
                  <input class="input" formControlName="phone" [class.is-err]="f('phone').invalid && f('phone').touched" placeholder="+20 100 000 0000" />
                  @if (f('phone').invalid && f('phone').touched) { <div class="form-error">{{ 'CO_VALID_PHONE' | tr }}</div> }
                </div>
                <div class="field" style="min-width:0">
                  <label>{{ 'CO_EMAIL' | tr }}</label>
                  <input class="input" type="email" formControlName="email" [class.is-err]="f('email').invalid && f('email').touched" placeholder="you@email.com" />
                  @if (f('email').invalid && f('email').touched) { <div class="form-error">{{ 'CO_VALID_EMAIL' | tr }}</div> }
                </div>
              </div>
            </div>
          </div>

          <div class="card block">
            <div class="block__head">
              <span class="block__num">02</span>
              <h3>{{ 'CO_PAYMENT' | tr }}</h3>
            </div>
            <div class="block__body">
              <div class="pay-grid">
                @for (m of methods; track m.key) {
                  <button type="button" class="pay" [class.active]="payment() === m.key" (click)="setPayment(m.key)">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" width="22" height="22" [innerHTML]="m.icon"></svg>
                    <span>{{ m.label }}</span>
                  </button>
                }
              </div>

              @if (payment() === 'card') {
                <div class="form-row" style="margin-top:18px">
                  <div class="field co-card--full" style="grid-column: 1/-1; min-width:0">
                    <label>{{ 'CO_CARD_NUMBER' | tr }}</label>
                    <input class="input" formControlName="card" inputmode="numeric" placeholder="1234 5678 9012 3456" (input)="formatCard($event)" />
                  </div>
                  <div class="field" style="min-width:0">
                    <label>{{ 'CO_CARD_NAME' | tr }}</label>
                    <input class="input" formControlName="cardName" placeholder="A. KHALIL" />
                  </div>
                  <div class="field" style="min-width:0">
                    <label>{{ 'CO_CARD_EXP' | tr }}</label>
                    <input class="input" formControlName="exp" placeholder="MM / YY" maxlength="7" (input)="formatExp($event)" />
                  </div>
                  <div class="field" style="min-width:0">
                    <label>{{ 'CO_CARD_CVV' | tr }}</label>
                    <input class="input" formControlName="cvv" inputmode="numeric" maxlength="4" placeholder="123" />
                  </div>
                </div>
              }

              <div class="promo">
                <input class="input" [value]="promoInput()" (input)="onPromo($event)" [placeholder]="'CO_PROMO' | tr" />
                <button type="button" class="btn btn--line btn--sm" (click)="applyPromo()">{{ promoApplied() ? ('CO_PROMO_APPLIED' | tr) : ('CO_PROMO_APPLY' | tr) }}</button>
              </div>
              @if (promoApplied()) {
                <div class="promo-note promo-note--ok">@if (promoRate() > 0) { – {{ promoRate() * 100 }}% } {{ 'CO_PROMO_APPLIED' | tr }}</div>
              }
              @if (promoError()) {
                <div class="promo-note promo-note--err">{{ 'CO_PROMO_ERR' | tr }}</div>
              }

              <label class="check" style="margin-top:16px">
                <input type="checkbox" formControlName="agree" />
                <span>{{ 'CO_AGREE' | tr }}</span>
              </label>
            </div>
          </div>
        </form>

        <aside class="co-right">
          <div class="card block block--sum">
            <div class="block__body">
              @if (showtime(); as st) {
                <h3 class="sum__movie">{{ movieTitle(st) }}</h3>
                <p class="sum__meta">{{ st.dateISO | day }} · {{ st.time | clock }} · {{ hallOf(st)?.name | local }}</p>

                <div class="sum__seats">
                  @for (code of seats(); track code) {
                    <span class="sum__seat"><b>{{ code }}</b><i>{{ seatPrice(st, code) | money }}</i></span>
                  }
                </div>

                <hr class="rule">
                <div class="sum__lines">
                  <span>{{ 'SEATS_SUBTOTAL' | tr }}</span>
                  <b>{{ totals.subtotal | money }}</b>
                  @if (totals.discount > 0) {
                    <span class="neg">{{ 'SEATS_DISCOUNT' | tr }}</span>
                    <b class="neg">– {{ totals.discount | money }}</b>
                  }
                  <span class="total">{{ 'SEATS_TOTAL' | tr }}</span>
                  <b class="total">{{ totals.total | money }}</b>
                </div>

                <button type="button" class="btn btn--gold btn--lg btn--block" [disabled]="form.invalid || seats().length === 0" (click)="submit()">
                  {{ payment() === 'paylater' ? ('CO_PAY_BTN_LATER' | tr) : ('CO_PAY_BTN' | tr) }}
                </button>
              } @else {
                <div class="empty-note">{{ 'SEATS_EMPTY' | tr }}</div>
                <a class="btn btn--line btn--block" routerLink="/movies" style="margin-top:14px">{{ 'MOVIES_TICKETS' | tr }}</a>
              }
            </div>
          </div>
        </aside>
      </div>
    </section>
  `,
  styles: `
    .co-head { margin-bottom: 28px; }
    .co-title { font-size: clamp(30px, 4.6vw, 46px); }
    .co-grid { display: grid; grid-template-columns: 1fr 360px; gap: 24px; align-items: start; }
    @media (max-width: 980px) { .co-grid { grid-template-columns: 1fr; } }
    .co-left { display: flex; flex-direction: column; gap: 18px; }
    .block { padding: 22px; }
    .block__head { display: flex; align-items: baseline; gap: 12px; margin-bottom: 18px; }
    .block__num { font-family: var(--font-display); font-style: italic; color: var(--gold); font-size: 15px; }
    .block__head h3 { font-size: 17px; }
    .block__head small { color: var(--text-3); font-size: 12.5px; }
    .is-err { border-color: var(--red) !important; }
    .pay-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
    @media (max-width: 480px) { .pay-grid { grid-template-columns: 1fr; } }
    .pay { display: flex; flex-direction: column; align-items: flex-start; gap: 10px; text-align: start; padding: 16px; border-radius: 12px; background: var(--surface); border: 1px solid var(--line); color: var(--text-2); font-size: 13px; font-weight: 600; transition: all .25s var(--ease); }
    .pay svg { color: var(--gold) ; }
    .pay:hover { border-color: var(--line-strong); }
    .pay.active { border-color: var(--gold); background: var(--gold-dim); color: var(--gold); }
    .co-card--full { grid-column: 1 / -1; }
    .promo { display: flex; gap: 10px; margin-top: 20px; }
    .promo .input { flex: 1; }
    .promo-note { font-size: 12.5px; margin-top: 8px; font-weight: 600; }
    .promo-note--ok { color: var(--green); }
    .promo-note--err { color: var(--red); }
    .co-right { position: sticky; top: calc(var(--header-h) + 18px); }
    @media (max-width: 980px) { .co-right { position: static; } }
    .sum__movie { font-size: 18px; margin-bottom: 6px; }
    .sum__meta { color: var(--text-3); font-size: 13px; text-transform: capitalize; margin-bottom: 16px; }
    .sum__seats { display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px; }
    .sum__seat { display: flex; justify-content: space-between; align-items: center; padding: 10px 14px; background: var(--surface); border: 1px solid rgba(201,164,102,.28); border-radius: 9px; }
    .sum__seat b { color: var(--gold); font-size: 14px; }
    .sum__seat i { font-style: normal; color: var(--text-2); font-size: 13px; }
    .sum__lines { display: grid; grid-template-columns: 1fr auto; gap: 9px 16px; font-size: 14px; color: var(--text-2); margin: 16px 0 18px; }
    .sum__lines b { color: var(--text); font-weight: 600; }
    .sum__lines .neg { color: var(--green); }
    .sum__lines .total { font-weight: 700; color: var(--text); font-size: 15px; }
  `,
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