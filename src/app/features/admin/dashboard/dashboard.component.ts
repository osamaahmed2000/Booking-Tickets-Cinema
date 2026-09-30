import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DataService } from '../../../core/services/data.service';
import { I18nService } from '../../../core/i18n/i18n.service';
import type { Booking } from '../../../core/models';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { MoneyPipe } from '../../../shared/pipes/money.pipe';

const DAY = 24 * 60 * 60 * 1000;

@Component({
  selector: 'admin-dashboard',
  standalone: true,
  imports: [RouterLink, TranslatePipe, MoneyPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="dash animate-in">
      <div class="dash__head">
        <div>
          <span class="kicker">{{ 'AD_DASH' | tr }}</span>
          <h1 class="dash__title">{{ 'AD_DASH' | tr }}</h1>
        </div>
        <div class="dash__quick">
          <a class="btn btn--gold btn--sm" routerLink="/admin/movies/new">+ {{ 'AD_MOV_ADD' | tr }}</a>
          <a class="btn btn--line btn--sm" routerLink="/admin/showtimes">+ {{ 'AD_ST_ADD' | tr }}</a>
        </div>
      </div>

      <div class="stats">
        <div class="stat card">
          <span class="stat__label">{{ 'AD_DASH_REVENUE' | tr }}</span>
          <b class="stat__value">{{ revenue | money }}</b>
          <span class="stat__delta">
            <i class="up">▲</i> {{ 'AD_STATS_WEEK' | tr }}
          </span>
        </div>
        <div class="stat card">
          <span class="stat__label">{{ 'AD_DASH_BOOKINGS' | tr }}</span>
          <b class="stat__value">{{ bookings().length }}</b>
          <span class="stat__delta">{{ todayCount }} {{ 'AD_STATS_TODAY' | tr }}</span>
        </div>
        <div class="stat card">
          <span class="stat__label">{{ 'AD_DASH_SEATS' | tr }}</span>
          <b class="stat__value">{{ seatsSold }}</b>
          <span class="stat__delta">{{ avgPerBooking }} / {{ 'MB_STATUS_CONFIRMED' | tr }}</span>
        </div>
        <div class="stat card">
          <span class="stat__label">{{ 'AD_DASH_OCCUPANCY' | tr }}</span>
          <b class="stat__value">{{ occupancy }}<i>%</i></b>
          <span class="stat__bar"><span [style.width.%]="occupancy"></span></span>
        </div>
      </div>

      <div class="dash__row">
        <div class="card panel">
          <div class="panel__head">
            <h3>{{ 'AD_DASH_7D' | tr }}</h3>
            <span class="tag tag--gold">{{ 'AD_STATS_WEEK' | tr }}</span>
          </div>
          <svg class="chart" viewBox="0 0 560 240" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Revenue chart">
            <defs>
              <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stop-color="#e6c98f" stop-opacity="0.95" />
                <stop offset="1" stop-color="#c9a466" stop-opacity="0.35" />
              </linearGradient>
            </defs>
            @for (g of gridLines; track g.y) {
              <line x1="34" [attr.y1]="g.y" x2="556" [attr.y2]="g.y" stroke="rgba(255,255,255,0.06)" stroke-width="1" />
            }
            @for (d of series; track d.i; let i = $index) {
              <g>
                <rect
                  [attr.x]="d.x" [attr.y]="d.y" [attr.width]="d.w" [attr.height]="d.h"
                  rx="6" fill="url(#barGrad)"
                  class="bar"
                />
                <text class="chart__val" [attr.x]="d.x + d.w / 2" [attr.y]="d.y - 10" text-anchor="middle">{{ d.short }}</text>
                <text class="chart__lbl" [attr.x]="d.x + d.w / 2" y="232" text-anchor="middle">{{ d.label }}</text>
              </g>
            }
          </svg>
        </div>

        <div class="card panel">
          <div class="panel__head">
            <h3>{{ 'AD_DASH_TOP' | tr }}</h3>
            <span class="tag">{{ 'AD_DASH_TOP_SUB' | tr }}</span>
          </div>
          <div class="sellers">
            @for (s of bestSellers; track s.movieId) {
              <div class="seller">
                <div class="seller__top">
                  <span class="seller__name">{{ s.title }}</span>
                  <span class="seller__count">{{ s.count }}</span>
                </div>
                <div class="seller__track"><span [style.width.%]="s.pct"></span></div>
              </div>
            }
            @if (bestSellers.length === 0) {
              <div class="empty-note">{{ 'AD_EMPTY_STATE' | tr }}</div>
            }
          </div>
        </div>
      </div>

      <div class="card panel">
        <div class="panel__head">
          <h3>{{ 'AD_DASH_RECENT' | tr }}</h3>
          <a class="panel__more" routerLink="/admin/bookings">{{ 'AD_DASH_VIEW_ALL' | tr }} →</a>
        </div>
        <div class="tbl">
          @for (b of latest; track b.id) {
            <div class="tbl__row">
              <span class="tbl__code">{{ b.code }}</span>
              <span class="tbl__name">{{ b.customer.name }}</span>
              <span class="tbl__movie">{{ movie(b) }}</span>
              <span class="tbl__seats">{{ b.seats.join(', ') }}</span>
              <span class="tbl__total">{{ b.total | money }}</span>
              <span class="badge" [class.badge--ok]="b.status === 'confirmed'" [class.badge--err]="b.status === 'cancelled'">
                {{ b.status === 'confirmed' ? ('MB_STATUS_CONFIRMED' | tr) : ('MB_STATUS_CANCELLED' | tr) }}
              </span>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: `
    .dash { animation: fadeUp .6s var(--ease) both; }
    .dash__head { display: flex; align-items: flex-end; justify-content: space-between; gap: 16px; margin-bottom: 26px; flex-wrap: wrap; }
    .dash__title { font-size: clamp(28px, 4vw, 40px); }
    .dash__quick { display: flex; gap: 10px; }

    .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 18px; }
    @media (max-width: 1100px) { .stats { grid-template-columns: 1fr 1fr; } }
    @media (max-width: 540px) { .stats { grid-template-columns: 1fr; } }
    .stat { padding: 20px; display: flex; flex-direction: column; gap: 6px; }
    .stat__label { font-size: 11px; letter-spacing: .18em; text-transform: uppercase; color: var(--text-3); font-weight: 700; }
    .stat__value { font-family: var(--font-display); font-size: 30px; font-weight: 700; color: var(--text); }
    .stat__value i { font-style: normal; font-size: 16px; color: var(--gold); }
    .stat__delta { font-size: 12px; color: var(--text-3); }
    .stat__delta .up { color: var(--green); font-style: normal; }
    .stat__bar { height: 5px; border-radius: 4px; background: var(--surface-2); overflow: hidden; margin-top: 8px; }
    .stat__bar span { display: block; height: 100%; background: linear-gradient(90deg, var(--gold), var(--gold-2)); border-radius: 4px; }

    .dash__row { display: grid; grid-template-columns: 1.6fr 1fr; gap: 14px; margin-bottom: 18px; }
    @media (max-width: 980px) { .dash__row { grid-template-columns: 1fr; } }
    .panel { padding: 20px; }
    .panel__head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 18px; }
    .panel__head h3 { font-size: 15px; }
    .panel__more { font-size: 12.5px; color: var(--gold); font-weight: 600; }
    .chart { width: 100%; height: auto; }
    .chart .bar { transition: opacity .2s; }
    .chart .bar:hover { opacity: .75; }
    .chart__val { fill: var(--text-2); font-size: 10px; font-weight: 600; font-family: Manrope, sans-serif; }
    .chart__lbl { fill: var(--text-3); font-size: 10px; font-family: Manrope, sans-serif; text-transform: capitalize; }

    .sellers { display: flex; flex-direction: column; gap: 15px; }
    .seller__top { display: flex; justify-content: space-between; margin-bottom: 7px; font-size: 13.5px; }
    .seller__name { color: var(--text); font-weight: 600; }
    .seller__count { color: var(--gold); font-weight: 700; }
    .seller__track { height: 6px; border-radius: 5px; background: var(--surface-2); overflow: hidden; }
    .seller__track span { display: block; height: 100%; background: linear-gradient(90deg, var(--gold), var(--gold-2)); border-radius: 5px; }

    .tbl { display: flex; flex-direction: column; }
    .tbl__row { display: grid; grid-template-columns: 110px 1.2fr 1.3fr 1fr 90px 90px; gap: 12px; align-items: center; padding: 13px 6px; border-top: 1px solid var(--line); font-size: 13.5px; }
    .tbl__row:first-child { border-top: 0; }
    .tbl__code { font-weight: 700; color: var(--gold); letter-spacing: .04em; }
    .tbl__name { color: var(--text); font-weight: 600; }
    .tbl__movie, .tbl__seats { color: var(--text-2); }
    .tbl__total { color: var(--text); font-weight: 700; }
    .badge { display: inline-flex; justify-content: center; padding: 4px 10px; border-radius: 999px; font-size: 11px; font-weight: 700; }
    .badge--ok { color: var(--green); background: rgba(134,181,141,.1); border: 1px solid rgba(134,181,141,.3); }
    .badge--err { color: var(--red); background: rgba(217,119,106,.1); border: 1px solid rgba(217,119,106,.3); }
    @media (max-width: 720px) {
      .tbl__row { grid-template-columns: 80px 1fr 80px; gap: 8px; }
      .tbl__movie, .tbl__seats { display: none; }
    }
  `,
  host: { class: 'page-admin-dash' },
})
export class AdminDashboardComponent {
  constructor(private data: DataService, private i18n: I18nService) {}

  bookings(): Booking[] {
    return this.data.bookings();
  }

  get revenue(): number {
    return this.bookings().filter((b) => b.status === 'confirmed').reduce((a, b) => a + b.total, 0);
  }

  get seatsSold(): number {
    return this.bookings().reduce((a, b) => a + b.seats.length, 0);
  }

  get avgPerBooking(): string {
    const n = this.bookings().length || 1;
    return (this.seatsSold / n).toFixed(1);
  }

  get todayCount(): number {
    const today = new Date().toISOString().slice(0, 10);
    return this.bookings().filter((b) => b.createdAt.slice(0, 10) === today).length;
  }

  get occupancy(): number {
    let cap = 0;
    let sold = 0;
    for (const st of this.data.showtimes()) {
      const hall = this.data.halls().find((h) => h.id === st.hallId);
      const capacity = hall ? hall.rows * hall.seatsPerRow : 1;
      cap += capacity;
      sold += st.bookedSeats.length;
    }
    return cap ? Math.round((sold / cap) * 100) : 0;
  }

  get gridLines(): { y: number }[] {
    return [0, 1, 2, 3].map((i) => ({ y: 30 + i * 50 }));
  }

  get series(): { i: number; x: number; y: number; w: number; h: number; short: string; label: string }[] {
    const days = 7;
    const W = 528;
    const H = 200;
    const gap = 14;
    const bw = (W - gap * (days - 1)) / days;
    const labels: string[] = [];
    const values: number[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(Date.now() - i * DAY);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const v = this.bookings().filter((b) => b.createdAt.slice(0, 10) === key).reduce((a, b) => a + b.total, 0);
      values.push(v);
      labels.push(
        new Intl.DateTimeFormat(this.i18n.locale(), { weekday: 'short' }).format(d),
      );
    }
    const max = Math.max(...values, 1);
    return values.map((v, i) => {
      const h = Math.max((v / max) * H, v > 0 ? 8 : 3);
      return {
        i,
        x: i * (bw + gap),
        y: H - h + 24,
        w: bw,
        h,
        short: v > 0 ? this.i18n.t('SEATS_TOTAL') && v >= 1000 ? `${Math.round(v / 1000)}k` : String(Math.round(v)) : '0',
        label: labels[i],
      };
    });
  }

  get bestSellers(): { movieId: string; title: string; count: number; pct: number }[] {
    const map = new Map<string, number>();
    for (const b of this.bookings()) {
      map.set(b.movieId, (map.get(b.movieId) ?? 0) + b.seats.length);
    }
    const arr = [...map.entries()]
      .map(([movieId, count]) => ({
        movieId,
        title: this.data.movies().find((m) => m.id === movieId)?.title[this.i18n.lang()] ?? movieId,
        count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
    const max = Math.max(...arr.map((a) => a.count), 1);
    return arr.map((a) => ({ ...a, pct: Math.round((a.count / max) * 100) }));
  }

  movie(b: Booking): string {
    return this.data.movies().find((m) => m.id === b.movieId)?.title[this.i18n.lang()] ?? '—';
  }

  get latest(): Booking[] {
    return this.bookings().slice(0, 5);
  }
}