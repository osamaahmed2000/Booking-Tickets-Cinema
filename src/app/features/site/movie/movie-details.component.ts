import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DataService } from '../../../core/services/data.service';
import { I18nService } from '../../../core/i18n/i18n.service';
import { BookingFlowService } from '../../../core/services/booking-flow.service';
import type { Movie, Showtime, CinemaHall } from '../../../core/models';
import { PosterComponent } from '../../../shared/ui/poster.component';
import { RevealDirective } from '../../../shared/directives/reveal.directive';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { LocalizePipe } from '../../../shared/pipes/localize.pipe';
import { DayShortPipe, ClockPipe, RelativeDayPipe } from '../../../shared/pipes/date.pipe';

@Component({
  selector: 'page-movie',
  standalone: true,
  imports: [RouterLink, PosterComponent, RevealDirective, TranslatePipe, LocalizePipe, DayShortPipe, ClockPipe, RelativeDayPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (movie(); as m) {
      <article class="md">
        <!-- header -->
        <header
          class="md__hero"
          [style.--b0]="m.art.bg[0]"
          [style.--b1]="m.art.bg[1]"
        >
          <div class="md__hero-shade"></div>
          <div class="container md__hero-in">
            <a class="md__back" routerLink="/movies">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M11 6l-6 6 6 6" stroke-linecap="round" stroke-linejoin="round"/></svg>
              {{ 'C_BACK' | tr }}
            </a>
            <div class="md__hero-grid">
              <div class="md__poster animate-in">
                <div class="md__poster-frame">
                  <app-poster [art]="m.art" [title]="m.title | local" [year]="m.year" />
                </div>
              </div>
              <div class="md__info animate-in" [style.animation-delay]="'.1s'">
                <div class="md__chips">
                  @if (m.badge) { <span class="tag tag--gold">{{ m.badge }}</span> }
                  @if (m.status === 'now') { <span class="tag tag--green">{{ 'MOVIES_NOW' | tr }}</span> }
                  @else { <span class="tag">{{ 'MOVIES_SOON' | tr }}</span> }
                </div>
                <h1 class="md__title">{{ m.title | local }}</h1>
                <p class="md__tagline">{{ m.tagline | local }}</p>

                <div class="md__score">
                  <div class="md__ring" [style.--pct]="m.rating * 10">
                    <svg viewBox="0 0 60 60"><circle class="ring__bg" cx="30" cy="30" r="26"/><circle class="ring__fg" cx="30" cy="30" r="26"/></svg>
                    <b>{{ m.rating.toFixed(1) }}</b>
                  </div>
                  <div class="md__meta">
                    <span>{{ m.year }} · {{ m.durationMin }} {{ 'C_MIN' | tr }} · {{ m.age }} · {{ m.rating.toFixed(1) }}</span>
                    <div class="md__genres">
                      @for (g of m.genres; track g.en) { <span>{{ g | local }}</span> }
                    </div>
                  </div>
                </div>

                <div class="md__facts">
                  <div><span>{{ 'MV_DIRECTOR' | tr }}</span><b>{{ m.director | local }}</b></div>
                  <div><span>{{ 'MV_CAST' | tr }}</span><b>{{ castLabel(m) }}</b></div>
                </div>

                <div class="md__actions">
                  @if (m.status === 'now') {
                    <button type="button" class="btn btn--gold btn--lg" (click)="jumpToShowtimes()">
                      {{ 'MOVIES_TICKETS' | tr }}
                      <svg class="icon-fwd" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 6l6 6-6 6" stroke-linecap="round" stroke-linejoin="round"/></svg>
                    </button>
                  } @else {
                    <span class="tag tag--gold md__soon-tag">● {{ 'MOVIES_NOT_AVAILABLE' | tr }}</span>
                  }
                </div>
              </div>
            </div>
          </div>
        </header>

        <!-- synopsis -->
        <section class="container section section--tight">
          <div class="md__columns" reveal>
            <div class="md__synopsis">
              <span class="kicker">{{ 'MV_SYNOPSIS' | tr }}</span>
              <p class="md__synopsis-text">{{ m.overview | local }}</p>
            </div>
            <div class="md__aside card" style="padding: 20px 24px;">
              <div class="md__aside-row"><span>{{ 'MV_YEAR' | tr }}</span><b>{{ m.year }}</b></div>
              <hr class="rule">
              <div class="md__aside-row"><span>{{ 'MV_RUNTIME' | tr }}</span><b>{{ m.durationMin }} {{ 'C_MIN' | tr }}</b></div>
              <hr class="rule">
              <div class="md__aside-row"><span>{{ 'MV_RATING' | tr }}</span><b>{{ m.rating.toFixed(1) }} / 10</b></div>
              <hr class="rule">
              <div class="md__aside-row"><span>{{ 'MV_AGE' | tr }}</span><b>{{ m.age }}</b></div>
              <hr class="rule">
              <div class="md__aside-row"><span>{{ 'MV_DIRECTOR' | tr }}</span><b>{{ m.director | local }}</b></div>
            </div>
          </div>
        </section>

        <!-- showtimes -->
        @if (m.status === 'now') {
          <section class="container section section--tight" id="showtimes">
            <div class="section-head" reveal>
              <div>
                <span class="kicker">{{ 'MV_SHOWTIMES_SUB' | tr }}</span>
                <h2 class="title">{{ 'MV_SHOWTIMES' | tr }}</h2>
              </div>
            </div>

            <div class="st-days" reveal>
              @for (d of days(); track d) {
                <button
                  type="button"
                  class="st-day"
                  [class.active]="day() === d"
                  (click)="day.set(d)"
                >
                  <b>{{ d | relativeDay }}</b>
                  <span>{{ d | dayShort }}</span>
                </button>
              }
            </div>

            @if (showtimesForDay().length === 0) {
              <div class="empty-note">{{ 'MV_NO_SHOWTIMES' | tr }}</div>
            } @else {
              <div class="st-grid" reveal>
                @for (st of showtimesForDay(); track st.id) {
                  <button type="button" class="st-card" (click)="pick(st)">
                    <div class="st-card__time">{{ st.time | clock }}</div>
                    <div class="st-card__meta">
                      <span class="tag tag--gold">{{ hallOf(st)?.kind }}</span>
                      <span class="st-card__hall">{{ hallOf(st)?.name | local }}</span>
                    </div>
                    <div class="st-card__price">{{ 'HOME_FEATURED_PRICE' | tr }} {{ st.price }} {{ currency }}</div>
                    <span class="st-card__go">
                      {{ 'MV_PICK_SEATS' | tr }}
                      <svg class="icon-fwd" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 6l6 6-6 6" stroke-linecap="round" stroke-linejoin="round"/></svg>
                    </span>
                  </button>
                }
              </div>
            }
          </section>
        }
      </article>
    } @else {
      <div class="empty-note" style="padding-block: 120px">{{ 'M_LOADING' | tr }}</div>
    }
  `,
  styles: `
    .md {}
    .md__hero { position: relative; isolation: isolate; overflow: hidden; background: linear-gradient(175deg, var(--b0), var(--b1)); border-bottom: 1px solid var(--line); }
    .md__hero-shade { position: absolute; inset: 0; background: linear-gradient(180deg, rgba(8,8,10,.6), var(--bg) 92%); }
    .md__hero-in { position: relative; z-index: 1; padding-top: 30px; padding-bottom: 40px; }
    .md__back { display: inline-flex; align-items: center; gap: 8px; color: var(--text-2); font-size: 13.5px; font-weight: 600; margin-bottom: 26px; transition: color .2s; }
    .md__back:hover { color: var(--gold); }
    .md__back svg { transform: scaleX(-1); }
    html[dir='rtl'] .md__back svg { transform: none; }

    .md__hero-grid { display: grid; grid-template-columns: 300px 1fr; gap: clamp(28px, 4vw, 56px); align-items: end; }
    .md__poster-frame { width: 300px; border-radius: 18px; overflow: hidden; box-shadow: var(--shadow-lg); }
    .md__chips { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 16px; }
    .md__title { font-size: clamp(36px, 6vw, 74px); line-height: 1.02; margin-bottom: 10px; }
    .md__tagline { font-family: var(--font-display); font-style: italic; color: var(--gold-2); font-size: clamp(15px, 2vw, 19px); margin-bottom: 24px; }
    .md__score { display: flex; align-items: center; gap: 18px; margin-bottom: 26px; }
    .md__ring { position: relative; width: 60px; height: 60px; flex-shrink: 0; }
    .md__ring svg { width: 60px; height: 60px; transform: rotate(-90deg); }
    .md__ring circle { fill: none; stroke-width: 3; }
    .md__ring .ring__bg { stroke: rgba(255,255,255,.1); }
    .md__ring .ring__fg { stroke: var(--gold); stroke-dasharray: 163.4; stroke-dashoffset: calc(163.4 * (1 - var(--pct) / 100)); stroke-linecap: round; }
    .md__ring b { position: absolute; inset: 0; display: grid; place-items: center; font-family: var(--font-display); font-size: 17px; }
    .md__meta span { color: var(--text-2); font-size: 14px; }
    .md__genres { display: flex; gap: 8px; margin-top: 10px; flex-wrap: wrap; }
    .md__genres span { font-size: 11.5px; color: var(--gold-2); background: var(--gold-dim); padding: 4px 12px; border-radius: 999px; }
    .md__facts { display: flex; gap: 44px; margin-bottom: 26px; flex-wrap: wrap; }
    .md__facts div { display: flex; flex-direction: column; gap: 3px; }
    .md__facts span { font-size: 11px; letter-spacing: .16em; text-transform: uppercase; color: var(--text-3); }
    .md__facts b { font-size: 14.5px; font-weight: 600; }
    .md__actions { display: flex; gap: 12px; align-items: center; }
    .md__soon-tag { padding: 12px 18px; }

    .md__columns { display: grid; grid-template-columns: 1fr 300px; gap: 48px; align-items: start; }
    .md__synopsis-text { font-size: 16.5px; line-height: 1.85; color: var(--text-2); max-width: 64ch; }
    .md__aside-row { display: flex; justify-content: space-between; gap: 16px; padding-block: 3px; font-size: 14px; }
    .md__aside-row span { color: var(--text-3); }
    .md__aside-row b { font-weight: 600; text-align: end; }

    .st-days { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 26px; }
    .st-day { display: flex; flex-direction: column; align-items: center; gap: 4px; min-width: 92px; padding: 13px 16px; border-radius: 12px; background: var(--surface); border: 1px solid var(--line); cursor: pointer; transition: all .25s var(--ease); }
    .st-day b { font-size: 13px; font-weight: 700; color: var(--text); }
    .st-day span { font-size: 11.5px; color: var(--text-3); text-transform: capitalize; }
    .st-day:hover { border-color: var(--line-strong); transform: translateY(-2px); }
    .st-day.active { border-color: var(--gold); background: var(--gold-dim); }
    .st-day.active b, .st-day.active span { color: var(--gold); }

    .st-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; }
    @media (max-width: 1080px) { .st-grid { grid-template-columns: repeat(3, 1fr); } }
    @media (max-width: 720px) { .st-grid { grid-template-columns: repeat(2, 1fr); } }
    @media (max-width: 440px) { .st-grid { grid-template-columns: 1fr; } }
    .st-card { text-align: start; display: flex; flex-direction: column; gap: 10px; padding: 18px; border-radius: 14px; background: linear-gradient(180deg, var(--surface), var(--bg-2)); border: 1px solid var(--line); cursor: pointer; transition: all .3s var(--ease); position: relative; }
    .st-card:hover { border-color: rgba(201,164,102,.5); transform: translateY(-3px); box-shadow: var(--shadow-md); }
    .st-card__time { font-family: var(--font-display); font-size: 27px; color: var(--text); }
    .st-card__meta { display: flex; align-items: center; gap: 8px; }
    .st-card__hall { font-size: 13px; color: var(--text-2); }
    .st-card__price { font-size: 12.5px; color: var(--text-3); }
    .st-card__go { display: inline-flex; align-items: center; gap: 8px; font-size: 12.5px; font-weight: 700; color: var(--gold); margin-top: 4px; }

    @media (max-width: 860px) {
      .md__hero-grid { grid-template-columns: 1fr; }
      .md__poster-frame { width: min(260px, 60%); }
      .md__columns { grid-template-columns: 1fr; }
    }
  `,
  host: { class: 'page-movie' },
})
export class MovieDetailsComponent {
  readonly day = signal('');
  private movieId = '';

  constructor(
    private data: DataService,
    private i18n: I18nService,
    private flow: BookingFlowService,
    private router: Router,
    route: ActivatedRoute,
  ) {
    route.params.subscribe((p) => {
      this.movieId = p['id'];
      const days = this.days();
      if (days.length && !days.includes(this.day())) this.day.set(days[0]);
    });
  }

  movie(): Movie | undefined {
    return this.data.movies().find((m) => m.id === this.movieId);
  }

  get lang() {
    return this.i18n.lang();
  }

  get currency(): string {
    return this.data.settings().currency;
  }

  days(): string[] {
    return [...new Set(this.data.showtimes().filter((s) => s.movieId === this.movieId).map((s) => s.dateISO))].sort();
  }

  showtimesForDay(): Showtime[] {
    const d = this.day() || this.days()[0];
    if (!d) return [];
    return this.data
      .showtimes()
      .filter((s) => s.movieId === this.movieId && s.dateISO === d)
      .sort((a, b) => a.time.localeCompare(b.time));
  }

  hallOf(st: Showtime): CinemaHall | undefined {
    return this.data.halls().find((h) => h.id === st.hallId);
  }

  castLabel(m: Movie): string {
    return m.cast.map((c) => c[this.i18n.lang()]).join(', ');
  }

  jumpToShowtimes(): void {
    document.getElementById('showtimes')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  pick(st: Showtime): void {
    this.flow.setShowtime(st);
    this.flow.clearSeats();
    this.router.navigate(['/movie', this.movieId, 'select'], { queryParams: { st: st.id } });
  }
}