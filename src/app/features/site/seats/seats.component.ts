import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DataService } from '../../../core/services/data.service';
import { I18nService } from '../../../core/i18n/i18n.service';
import { BookingFlowService } from '../../../core/services/booking-flow.service';
import type { Showtime, CinemaHall, Movie } from '../../../core/models';
import { bookingTotals } from '../../../core/utils';
import { SeatMapComponent } from '../../../shared/ui/seat-map.component';
import { PosterComponent } from '../../../shared/ui/poster.component';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { LocalizePipe } from '../../../shared/pipes/localize.pipe';
import { DayPipe, ClockPipe } from '../../../shared/pipes/date.pipe';
import { MoneyPipe } from '../../../shared/pipes/money.pipe';
import { RelativeDayPipe } from '../../../shared/pipes/date.pipe';

@Component({
  selector: 'page-seats',
  standalone: true,
  imports: [RouterLink, SeatMapComponent, PosterComponent, TranslatePipe, LocalizePipe, DayPipe, ClockPipe, RelativeDayPipe, MoneyPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (showtime(); as st) {
      <section class="container section section--tight">
        <div class="seats-head animate-in">
          <div>
            <span class="kicker">{{ 'SEATS_TITLE' | tr }}</span>
            <h1 class="seats-title">
              {{ movieTitle(st) }}
            </h1>
            <p class="seats-head__info">
              {{ st.dateISO | day }} · {{ st.time | clock }} ·
              <a [routerLink]="['/movie', movieOf(st)?.id]" class="link">{{ hallOf(st)?.name | local }}</a>
            </p>
          </div>
          <div class="seats-crumbs">
            <span class="done">{{ 'MV_PICK_DATE' | tr }}</span>
            <span class="done">{{ 'MV_PICK_TIME' | tr }}</span>
            <span class="active">{{ 'MV_PICK_SEATS' | tr }}</span>
          </div>
        </div>

        <div class="seats-grid">
          <div class="seats-left">
            <div class="seat-card card" [class.animate-in]="true">
              <app-seat-map
                [hall]="hallOf(st)!"
                [booked]="st.bookedSeats"
                [selected]="selection()"
                (toggle)="onToggle($event)"
              />
              <div class="legend">
                <span><i class="sw sw--av"></i>{{ 'SEATS_LEGEND_AVAILABLE' | tr }}</span>
                <span><i class="sw sw--sel"></i>{{ 'SEATS_LEGEND_SELECTED' | tr }}</span>
                <span><i class="sw sw--taken"></i>{{ 'SEATS_LEGEND_TAKEN' | tr }}</span>
                <span><i class="sw sw--vip"></i>{{ 'SEATS_LEGEND_VIP' | tr }}</span>
              </div>
              <p class="seats-hint">{{ 'SEATS_MAX' | tr }}</p>
            </div>
          </div>

          <aside class="summary">
            <div class="summary__card card">
              <div class="summary__top">
                <div class="summary__poster">
                  @if (movieOf(st); as m) {
                    <app-poster [art]="m.art" [title]="m.title | local" [year]="m.year" />
                  }
                </div>
                <div class="summary__id">
                  <h3>{{ movieTitle(st) }}</h3>
                  <span class="tag tag--gold">{{ hallOf(st)?.kind }}</span>
                  <p>{{ hallOf(st)?.name | local }}</p>
                  <p class="summary__date">{{ st.dateISO | relativeDay }} · {{ st.dateISO | day }} · {{ st.time | clock }}</p>
                </div>
              </div>

              <hr class="rule">

              <div class="summary__seats">
                <h4>{{ 'SEATS_SUMMARY' | tr }}</h4>
                @if (selection().length === 0) {
                  <p class="summary__empty">{{ 'SEATS_EMPTY' | tr }}</p>
                } @else {
                  <div class="summary__chips">
                    @for (code of selection(); track code) {
                      <button type="button" class="seat-chip" (click)="onToggle(code)">
                        <b>{{ code }}</b>
                        <span>{{ seatPriceAbs(st, code) }}</span>
                        <i>×</i>
                      </button>
                    }
                  </div>
                }
              </div>

              <hr class="rule">

              <div class="summary__total">
                <div class="row"><span>{{ 'SEATS_SUBTOTAL' | tr }}</span><b>{{ totals.subtotal | money }}</b></div>
                <div class="row"><span>{{ 'SEATS_COUNT' | tr }}</span><b>{{ selection().length }}</b></div>
              </div>

              <button type="button" class="btn btn--gold btn--lg btn--block summary__cta" [disabled]="selection().length === 0" (click)="next()">
                {{ 'SEATS_CONTINUE' | tr }}
                <svg class="icon-fwd" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 6l6 6-6 6" stroke-linecap="round" stroke-linejoin="round"/></svg>
              </button>
            </div>
          </aside>
        </div>
      </section>
    } @else {
      <div class="empty-note" style="padding-block: 140px">
        {{ 'SEATS_EMPTY' | tr }}
        <div style="margin-top:18px"><a class="btn btn--line" routerLink="/movies">{{ 'MOVIES_TICKETS' | tr }}</a></div>
      </div>
    }
  `,
  styles: `
    .seats-head { display: flex; align-items: flex-end; justify-content: space-between; gap: 20px; flex-wrap: wrap; margin-bottom: 30px; }
    .seats-title { font-size: clamp(26px, 4vw, 40px); }
    .seats-head__info { color: var(--text-2); margin-top: 8px; text-transform: capitalize; }
    .link { color: var(--gold); }
    .seats-crumbs { display: flex; gap: 10px; align-items: center; font-size: 12px; }
    .seats-crumbs span { color: var(--text-3); }
    .seats-crumbs .done::after { content: '→'; margin-inline-start: 10px; color: var(--text-3); }
    .seats-crumbs .active { color: var(--gold); font-weight: 700; }

    .seats-grid { display: grid; grid-template-columns: 1fr 320px; gap: 24px; align-items: start; }
    @media (max-width: 960px) { .seats-grid { grid-template-columns: 1fr; } }

    .seat-card { padding: 20px; position: sticky; top: calc(var(--header-h) + 18px); }
    @media (max-width: 960px) { .seat-card { position: static; } }
    .legend { display: flex; gap: 18px; justify-content: center; flex-wrap: wrap; margin-top: 22px; }
    .legend span { display: inline-flex; align-items: center; gap: 8px; font-size: 12.5px; color: var(--text-2); }
    .sw { width: 14px; height: 14px; border-radius: 4px; display: inline-block; }
    .sw--av { background: rgba(255,255,255,.07); border: 1px solid rgba(255,255,255,.16); }
    .sw--sel { background: linear-gradient(135deg, var(--gold-2), var(--gold)); }
    .sw--taken { background: rgba(255,255,255,.03); border: 1px solid rgba(255,255,255,.05); }
    .sw--vip { background: linear-gradient(180deg, rgba(201,164,102,.45), rgba(201,164,102,.2)); border: 1px solid rgba(201,164,102,.75); }
    .seats-hint { text-align: center; color: var(--text-3); font-size: 12px; margin-top: 14px; }

    .summary { position: sticky; top: calc(var(--header-h) + 18px); }
    @media (max-width: 960px) { .summary { position: static; } }
    .summary__card { padding: 20px; }
    .summary__top { display: flex; gap: 14px; }
    .summary__poster { width: 64px; flex-shrink: 0; aspect-ratio: 2/3; border-radius: 8px; overflow: hidden; }
    .summary__id h3 { font-size: 16px; margin-bottom: 6px; line-height: 1.3; }
    .summary__id p { font-size: 13px; color: var(--text-3); margin-top: 6px; }
    .summary__id .tag { margin-top: 2px; }
    .summary__date { text-transform: capitalize; }
    .summary__seats h4 { font-size: 13px; letter-spacing: .12em; text-transform: uppercase; color: var(--text-3); margin-bottom: 12px; }
    .summary__empty { color: var(--text-3); font-size: 13.5px; padding-block: 8px; }
    .summary__chips { display: flex; flex-wrap: wrap; gap: 8px; }
    .seat-chip { display: inline-flex; align-items: center; gap: 8px; border: 1px solid rgba(201,164,102,.45); background: var(--gold-dim); color: var(--gold); border-radius: 8px; padding: 7px 12px; font-size: 13px; transition: all .2s; }
    .seat-chip b { font-weight: 700; }
    .seat-chip span { color: var(--text-2); font-size: 12px; }
    .seat-chip i { font-style: normal; opacity: .7; }
    .seat-chip:hover { background: rgba(217,119,106,.14); border-color: rgba(217,119,106,.5); color: var(--red); }
    .seat-chip:hover span { color: var(--red); }
    .summary__total { display: flex; flex-direction: column; gap: 8px; }
    .row { display: flex; justify-content: space-between; font-size: 14px; color: var(--text-2); }
    .row b { color: var(--text); }
    .summary__cta { margin-top: 18px; }
  `,
  host: { class: 'page-seats' },
})
export class SeatsComponent {
  private readonly selectedSet = signal<string[]>([]);

  constructor(
    private data: DataService,
    private i18n: I18nService,
    private flow: BookingFlowService,
    private router: Router,
    private route: ActivatedRoute,
  ) {
    const id = route.snapshot.queryParamMap.get('st');
    if (id) {
      const st = this.data.showtimes().find((s) => s.id === id);
      if (st) {
        this.flow.setShowtime(st);
        this.flow.clearSeats();
      }
    }
    this.selectedSet.set(this.flow.selection().seats);
  }

  showtime(): Showtime | null {
    return this.flow.showtime();
  }

  selection(): string[] {
    return this.selectedSet();
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

  seatPriceAbs(st: Showtime, code: string): string {
    const hall = this.hallOf(st);
    if (!hall) return '';
    const info = /^([A-Z]+)(\d+)$/.exec(code);
    const vipStart = Math.max(0, hall.rows - hall.vipRows);
    const idx = info ? info[1].charCodeAt(0) - 65 : 0;
    const price = idx >= vipStart ? st.vipPrice : st.price;
    return `${price} ${this.data.settings().currency}`;
  }

  get totals() {
    const st = this.showtime();
    const hall = st ? this.hallOf(st) : undefined;
    if (!st || !hall) return { subtotal: 0, discount: 0, total: 0 };
    return bookingTotals(hall, st, this.selection(), 0);
  }

  onToggle(code: string): void {
    const current = [...this.selectedSet()];
    if (current.includes(code)) {
      this.selectedSet.set(current.filter((c) => c !== code));
    } else {
      if (current.length >= 8) return;
      this.selectedSet.set([...current, code]);
    }
    this.flow.toggleSeat(code);
  }

  next(): void {
    this.router.navigate(['/checkout']);
  }
}