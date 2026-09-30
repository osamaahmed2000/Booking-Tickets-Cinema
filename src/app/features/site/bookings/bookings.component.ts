import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DataService } from '../../../core/services/data.service';
import { I18nService } from '../../../core/i18n/i18n.service';
import { StorageService } from '../../../core/services/storage.service';
import { ToastService } from '../../../core/services/toast.service';
import type { Booking, Showtime, CinemaHall, Movie } from '../../../core/models';
import { PosterComponent } from '../../../shared/ui/poster.component';
import { ModalComponent } from '../../../shared/ui/modal.component';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { LocalizePipe } from '../../../shared/pipes/localize.pipe';
import { DayPipe, ClockPipe } from '../../../shared/pipes/date.pipe';
import { MoneyPipe } from '../../../shared/pipes/money.pipe';

const MYREFS = 'noir:myrefs';

@Component({
  selector: 'page-bookings',
  standalone: true,
  imports: [RouterLink, PosterComponent, ModalComponent, TranslatePipe, LocalizePipe, DayPipe, ClockPipe, MoneyPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="container section section--tight">
      <div class="section-head animate-in">
        <div>
          <span class="kicker">{{ 'MB_SUB' | tr }}</span>
          <h1 class="mb-title">{{ 'MB_TITLE' | tr }}</h1>
        </div>
      </div>

      <div class="lookup animate-in">
        <div class="lookup__field">
          <label>{{ 'MB_LOOKUP' | tr }}</label>
          <div class="lookup__row">
            <input class="input" [value]="q()" (input)="onSearch($event)" [attr.placeholder]="'MB_LOOKUP_PH' | tr" />
            <button type="button" class="btn btn--gold btn--sm" (click)="lookup()">{{ 'MB_LOOKUP_BTN' | tr }}</button>
          </div>
        </div>
        @if (lookupResult(); as b) {
          <div class="ticket-mini card animate-in">
            <div class="ticket-mini__poster">
              @if (movieOf(b); as m) { <app-poster [art]="m.art" [title]="m.title | local" [year]="m.year" /> }
            </div>
            <div class="ticket-mini__info">
              <h3>{{ movieTitle(b) }}</h3>
              <p>{{ (showtimeOf(b)?.dateISO ?? '') | day }} · {{ (showtimeOf(b)?.time ?? '') | clock }} · {{ hallOf(b)?.name | local }}</p>
              <div class="ticket-mini__seats">
                @for (s of b.seats; track s) { <span>{{ s }}</span> }
              </div>
            </div>
            <div class="ticket-mini__code">
              <span>{{ 'TICKET_CODE' | tr }}</span>
              <b>{{ b.code }}</b>
              <span class="badge" [class.badge--ok]="b.status === 'confirmed'" [class.badge--err]="b.status === 'cancelled'">
                {{ b.status === 'confirmed' ? ('MB_STATUS_CONFIRMED' | tr) : ('MB_STATUS_CANCELLED' | tr) }}
              </span>
            </div>
          </div>
        }
        @if (lookupMiss()) {
          <div class="lookup__miss">{{ 'MB_NOT_FOUND' | tr }}</div>
        }
      </div>

      <div class="mb-list">
        @if (myBookings().length === 0) {
          <div class="empty-note" style="padding-block: 70px">
            {{ 'MB_EMPTY' | tr }}
            <div style="margin-top:16px"><a class="btn btn--gold" routerLink="/movies">{{ 'MB_EMPTY_CTA' | tr }}</a></div>
          </div>
        } @else {
          @for (b of myBookings(); track b.code) {
            <div class="mb-item card" reveal>
              <div class="mb-item__poster">
                @if (movieOf(b); as m) { <app-poster [art]="m.art" [title]="m.title | local" [year]="m.year" /> }
              </div>
              <div class="mb-item__body">
                <div class="mb-item__top">
                  <span class="mb-item__order">{{ 'MB_ORDER' | tr }} · {{ b.code }}</span>
                  <span class="badge" [class.badge--ok]="b.status === 'confirmed'" [class.badge--err]="b.status === 'cancelled'">
                    {{ b.status === 'confirmed' ? ('MB_STATUS_CONFIRMED' | tr) : ('MB_STATUS_CANCELLED' | tr) }}
                  </span>
                </div>
                <h3 class="mb-item__title">{{ movieTitle(b) }}</h3>
                <p class="mb-item__meta">{{ (showtimeOf(b)?.dateISO ?? '') | day }} · {{ (showtimeOf(b)?.time ?? '') | clock }} · {{ hallOf(b)?.name | local }}</p>
                <div class="mb-item__foot">
                  <div class="mb-item__seats">
                    @for (s of b.seats; track s) { <span>{{ s }}</span> }
                  </div>
                  <div class="mb-item__total">
                    <b>{{ b.total | money }}</b>
                    <span>{{ (movieOf(b)?.rating ?? 0).toFixed(1) }}/10</span>
                  </div>
                </div>
              </div>
              <div class="mb-item__actions">
                <a class="btn btn--line btn--sm" [routerLink]="['/movie', b.movieId]">{{ 'MB_REBOOK' | tr }}</a>
                @if (b.status === 'confirmed') {
                  <button type="button" class="btn btn--ghost btn--sm" (click)="askCancel(b)">{{ 'MB_CANCEL' | tr }}</button>
                }
              </div>
            </div>
          }
        }
      </div>
    </section>

    <app-modal [open]="cancelTarget() !== null" [title]="'MB_CANCEL' | tr" (close)="cancelTarget.set(null)">
      <p style="color: var(--text-2); margin-bottom: 18px;">{{ 'MB_CANCEL_CONFIRM' | tr }}</p>
      <div class="modal-actions">
        <button type="button" class="btn btn--line" (click)="cancelTarget.set(null)">{{ 'C_CANCEL' | tr }}</button>
        <button type="button" class="btn btn--danger" (click)="confirmCancel()">{{ 'C_YES' | tr }}</button>
      </div>
    </app-modal>
  `,
  styles: `
    .mb-title { font-size: clamp(30px, 5vw, 48px); }
    .lookup { max-width: 560px; margin-bottom: 44px; }
    .lookup__field label { font-size: 11px; font-weight: 700; letter-spacing: .2em; text-transform: uppercase; color: var(--text-3); display: block; margin-bottom: 10px; }
    .lookup__row { display: flex; gap: 10px; }
    .lookup__row .input { flex: 1; }
    .lookup__miss { color: var(--red); font-size: 13.5px; margin-top: 12px; }
    .ticket-mini { display: grid; grid-template-columns: 84px 1fr auto; gap: 18px; align-items: center; padding: 18px; margin-top: 18px; animation: fadeUp .5s var(--ease) both; }
    .ticket-mini__poster { width: 84px; aspect-ratio: 2/3; border-radius: 8px; overflow: hidden; }
    .ticket-mini__info h3 { font-size: 17px; margin-bottom: 6px; }
    .ticket-mini__info p { color: var(--text-3); font-size: 13px; text-transform: capitalize; margin-bottom: 10px; }
    .ticket-mini__seats, .mb-item__seats { display: flex; gap: 6px; flex-wrap: wrap; }
    .ticket-mini__seats span, .mb-item__seats span { font-size: 12px; font-weight: 700; color: var(--gold); background: var(--gold-dim); border: 1px solid rgba(201,164,102,.3); padding: 4px 9px; border-radius: 6px; }
    .ticket-mini__code { display: flex; flex-direction: column; align-items: flex-end; gap: 6px; }
    .ticket-mini__code span { font-size: 9.5px; letter-spacing: .2em; text-transform: uppercase; color: var(--text-3); }
    .ticket-mini__code b { font-family: var(--font-display); font-size: 20px; letter-spacing: .12em; }
    @media (max-width: 640px) { .ticket-mini { grid-template-columns: 1fr; } .ticket-mini__code { align-items: flex-start; } }

    .mb-list { display: flex; flex-direction: column; gap: 14px; }
    .mb-item { display: grid; grid-template-columns: 76px 1fr auto; gap: 20px; align-items: center; padding: 18px; }
    @media (max-width: 720px) { .mb-item { grid-template-columns: 60px 1fr; } .mb-item__actions { grid-column: 1 / -1; display: flex; justify-content: flex-start; } }
    .mb-item__poster { width: 76px; aspect-ratio: 2/3; border-radius: 8px; overflow: hidden; }
    @media (max-width: 720px) { .mb-item__poster { width: 60px; } }
    .mb-item__top { display: flex; align-items: center; gap: 12px; margin-bottom: 6px; }
    .mb-item__order { font-size: 11px; letter-spacing: .18em; text-transform: uppercase; color: var(--text-3); }
    .mb-item__title { font-size: 18px; margin-bottom: 4px; }
    .mb-item__meta { color: var(--text-3); font-size: 13px; text-transform: capitalize; margin-bottom: 14px; }
    .mb-item__foot { display: flex; align-items: flex-end; justify-content: space-between; gap: 14px; }
    .mb-item__total { text-align: end; }
    .mb-item__total b { font-family: var(--font-display); font-size: 20px; color: var(--gold-2); display: block; }
    .mb-item__total span { font-size: 12px; color: var(--text-3); }
    .mb-item__actions { display: flex; flex-direction: column; gap: 8px; }

    .badge { display: inline-flex; padding: 4px 11px; border-radius: 999px; font-size: 11px; font-weight: 700; letter-spacing: .04em; }
    .badge--ok { color: var(--green); background: rgba(134,181,141,.1); border: 1px solid rgba(134,181,141,.3); }
    .badge--err { color: var(--red); background: rgba(217,119,106,.1); border: 1px solid rgba(217,119,106,.3); }
    .modal-actions { display: flex; gap: 10px; justify-content: flex-end; }
  `,
  host: { class: 'page-bookings' },
})
export class BookingsComponent {
  readonly q = signal('');
  readonly lookupResult = signal<Booking | null>(null);
  readonly lookupMiss = signal(false);
  readonly cancelTarget = signal<Booking | null>(null);

  constructor(
    private data: DataService,
    private i18n: I18nService,
    private storage: StorageService,
    private toast: ToastService,
  ) {}

  private refs(): string[] {
    return this.storage.get<string[]>(MYREFS) ?? [];
  }

  myBookings(): Booking[] {
    const refs = this.refs();
    return this.data
      .bookings()
      .filter((b) => refs.includes(b.code))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  showtimeOf(b: Booking): Showtime | undefined {
    return this.data.showtimes().find((s) => s.id === b.showtimeId);
  }

  hallOf(b: Booking): CinemaHall | undefined {
    const st = this.showtimeOf(b);
    return st ? this.data.halls().find((h) => h.id === st.hallId) : undefined;
  }

  movieOf(b: Booking): Movie | undefined {
    return this.data.movies().find((m) => m.id === b.movieId);
  }

  movieTitle(b: Booking): string {
    return this.movieOf(b)?.title[this.i18n.lang()] ?? '';
  }

  onSearch(e: Event): void {
    this.q.set((e.target as HTMLInputElement).value);
  }

  lookup(): void {
    const code = this.q().trim().toUpperCase();
    if (!code) return;
    const found =
      this.data.bookings().find((b) => b.code.toUpperCase() === code) ?? null;
    if (found) {
      const refs = this.refs();
      if (!refs.includes(found.code)) {
        refs.unshift(found.code);
        this.storage.set(MYREFS, refs.slice(0, 50));
      }
    }
    this.lookupResult.set(found);
    this.lookupMiss.set(!found);
  }

  askCancel(b: Booking): void {
    this.cancelTarget.set(b);
  }

  confirmCancel(): void {
    const b = this.cancelTarget();
    if (!b) return;
    this.data.cancelBooking(b.id);
    this.cancelTarget.set(null);
    this.toast.ok(this.i18n.t('TOAST_DELETED'));
  }
}