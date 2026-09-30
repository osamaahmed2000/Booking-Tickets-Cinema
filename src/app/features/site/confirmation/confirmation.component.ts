import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DataService } from '../../../core/services/data.service';
import { I18nService } from '../../../core/i18n/i18n.service';
import type { Booking, Showtime, CinemaHall, Movie } from '../../../core/models';
import { QrComponent } from '../../../shared/ui/qr.component';
import { BarcodeComponent } from '../../../shared/ui/barcode.component';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { LocalizePipe } from '../../../shared/pipes/localize.pipe';
import { DayPipe, ClockPipe } from '../../../shared/pipes/date.pipe';
import { MoneyPipe } from '../../../shared/pipes/money.pipe';

@Component({
  selector: 'page-confirmation',
  standalone: true,
  imports: [RouterLink, QrComponent, BarcodeComponent, TranslatePipe, LocalizePipe, DayPipe, ClockPipe, MoneyPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (booking(); as b) {
      <section class="container section section--tight">
        <div class="cf-head animate-in">
          <span class="kicker kicker--muted">{{ 'CO_DONE_KICKER' | tr }}</span>
          <h1 class="cf-title">{{ 'CO_DONE_T' | tr }}</h1>
          <p class="cf-sub">{{ 'TICKET_EMAILED' | tr: { email: b.customer.email } }}</p>
        </div>

        <div class="cf-stage">
          <div class="ticket animate-in">
            <div class="ticket__main">
              <div class="ticket__brand">
                <span>{{ 'CINEMA_NAME' | tr }}</span>
                <i>·</i>
                <span>{{ 'TICKET_STUB' | tr }}</span>
              </div>

              <h2 class="ticket__film">{{ movieTitle(b) }}</h2>
              <p class="ticket__tagline">{{ movieOf(b)?.tagline | local }}</p>

              <div class="ticket__grid">
                <div class="tk">
                  <span>{{ 'TICKET_MOVIE' | tr }}</span>
                  <b>{{ movieTitle(b) }}</b>
                </div>
                <div class="tk">
                  <span>{{ 'TICKET_HALL' | tr }}</span>
                  <b>{{ hallOf(b)?.name | local }} <em>{{ hallOf(b)?.kind }}</em></b>
                </div>
                <div class="tk">
                  <span>{{ 'TICKET_DATE' | tr }}</span>
                  <b>{{ (showtimeOf(b)?.dateISO ?? '') | day }}</b>
                </div>
                <div class="tk">
                  <span>{{ 'TICKET_TIME' | tr }}</span>
                  <b>{{ (showtimeOf(b)?.time ?? '') | clock }}</b>
                </div>
                <div class="tk">
                  <span>{{ 'TICKET_SEATS' | tr }}</span>
                  <b class="tk__seats">{{ b.seats.join(' · ') }}</b>
                </div>
                <div class="tk">
                  <span>{{ 'TICKET_PRICE' | tr }}</span>
                  <b>{{ b.total | money }}</b>
                </div>
              </div>

              <p class="ticket__doors">{{ 'TICKET_DOORS' | tr }}</p>
            </div>

            <div class="ticket__perf" aria-hidden="true"></div>

            <div class="ticket__stub">
              <div class="ticket__code">
                <span>{{ 'TICKET_CODE' | tr }}</span>
                <b>{{ b.code }}</b>
              </div>
              <app-qr [value]="b.code + '-' + b.id" />
              <app-barcode [value]="b.code + b.showtimeId" />
              <p class="ticket__admit">ADMIT ONE</p>
            </div>
          </div>

          <div class="cf-actions">
            <button type="button" class="btn btn--gold" (click)="print()">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6 9V3h12v6M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="7"/></svg>
              {{ 'TICKET_DOWNLOAD' | tr }}
            </button>
            <a class="btn btn--line" routerLink="/bookings">{{ 'TICKET_NEW' | tr }}</a>
          </div>
        </div>
      </section>
    } @else {
      <div class="empty-note" style="padding-block: 140px">
        No ticket found.
        <div style="margin-top:18px"><a class="btn btn--line" routerLink="/">Home</a></div>
      </div>
    }
  `,
  styles: `
    .cf-head { text-align: center; margin-bottom: 36px; }
    .cf-title { font-size: clamp(30px, 5vw, 48px); }
    .cf-sub { color: var(--text-3); margin-top: 8px; font-size: 14.5px; }

    .cf-stage { display: flex; flex-direction: column; align-items: center; gap: 26px; }

    .ticket {
      width: min(860px, 100%); display: grid; grid-template-columns: 1fr 250px;
      background: #f4f1ea; color: #141210; border-radius: 20px; overflow: hidden;
      box-shadow: var(--shadow-lg); position: relative;
    }
    .ticket__main { padding: 34px 36px; }
    .ticket__brand { display: flex; gap: 10px; font-size: 10px; font-weight: 800; letter-spacing: .3em; text-transform: uppercase; color: #9a8574; margin-bottom: 18px; }
    .ticket__brand i { font-style: normal; }
    .ticket__film { font-family: 'Playfair Display', serif; font-size: clamp(26px, 4vw, 34px); line-height: 1.1; color: #141210; }
    .ticket__tagline { font-style: italic; color: #8d7c6c; font-size: 14px; margin: 10px 0 24px; }
    .ticket__grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0; }
    .tk { border-top: 1px solid rgba(20,18,16,.12); padding: 13px 20px 13px 0; display: flex; flex-direction: column; gap: 3px; }
    .tk:nth-child(odd) { padding-inline-end: 26px; }
    .tk span { font-size: 9.5px; font-weight: 800; letter-spacing: .22em; text-transform: uppercase; color: #a08a78; }
    .tk b { font-size: 15.5px; font-weight: 700; color: #141210; }
    .tk b em { font-style: normal; font-size: 11px; color: #a08a78; margin-inline-start: 6px; letter-spacing: .1em; }
    .tk__seats { color: #141210; letter-spacing: .04em; }
    .ticket__doors { margin-top: 22px; font-size: 12px; color: #a08a78; }

    .ticket__perf {
      position: relative; width: 30px; background: #141210; flex-shrink: 0;
    }
    .ticket__perf::before, .ticket__perf::after {
      content: ''; position: absolute; inset-inline-start: 50%; width: 30px; height: 30px; border-radius: 50%;
      transform: translateX(-50%); background: var(--bg); border: 1px solid rgba(4,4,6,.5);
    }
    html[dir='rtl'] .ticket__perf::before, html[dir='rtl'] .ticket__perf::after { transform: translateX(50%); }
    .ticket__perf::before { top: -15px; }
    .ticket__perf::after { bottom: -15px; }

    .ticket__stub { background: #f4f1ea; border-inline-start: 1px dashed rgba(20,18,16,.25); padding: 26px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16px; color: #141210; }
    .ticket__code { text-align: center; }
    .ticket__code span { display: block; font-size: 8.5px; font-weight: 800; letter-spacing: .26em; text-transform: uppercase; color: #a08a78; margin-bottom: 4px; }
    .ticket__code b { font-size: 19px; letter-spacing: .16em; font-family: 'Playfair Display', serif; }
    .ticket__admit { font-size: 10px; font-weight: 800; letter-spacing: .34em; color: #a08a78; }

    .cf-actions { display: flex; gap: 12px; flex-wrap: wrap; justify-content: center; }

    @media (max-width: 720px) {
      .ticket { grid-template-columns: 1fr; }
      .ticket__perf { display: none; }
      .ticket__stub { border-inline-start: 0; border-top: 1px dashed rgba(20,18,16,.3); }
      .ticket__grid { grid-template-columns: 1fr; }
    }

    @media print {
      :host { background: #fff; }
      body::after { display: none; }
      .cf-head, .cf-actions { display: none !important; }
      .ticket { box-shadow: none; border: 1px solid #ddd; }
    }
  `,
  host: { class: 'page-confirmation' },
})
export class ConfirmationComponent {
  private code = '';

  constructor(
    private data: DataService,
    private i18n: I18nService,
    route: ActivatedRoute,
  ) {
    route.params.subscribe((p) => (this.code = p['code']));
  }

  booking(): Booking | undefined {
    return this.data.bookings().find((b) => b.code === this.code) ??
      this.data.bookings().find((b) => b.code.toUpperCase() === this.code.toUpperCase());
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

  print(): void {
    window.print();
  }
}