import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DataService } from '../../../core/services/data.service';
import { I18nService } from '../../../core/i18n/i18n.service';
import { ToastService } from '../../../core/services/toast.service';
import type { Movie } from '../../../core/models';
import { PosterComponent } from '../../../shared/ui/poster.component';
import { MovieCardComponent } from '../../../shared/ui/movie-card.component';
import { RevealDirective } from '../../../shared/directives/reveal.directive';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { LocalizePipe } from '../../../shared/pipes/localize.pipe';

@Component({
  selector: 'page-home',
  standalone: true,
  imports: [
    RouterLink,
    PosterComponent,
    MovieCardComponent,
    RevealDirective,
    TranslatePipe,
    LocalizePipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- HERO -->
    <header class="hero" [style.--b0]="featured().art.bg[0]" [style.--b1]="featured().art.bg[1]">
      <div class="hero__glow"></div>
      <div class="container hero__grid">
        <div class="hero__text" [class.animate-in]="true">
          <span class="kicker">{{ 'HOME_HERO_KICKER' | tr }}</span>
          <h1 class="hero__title">
            <span class="hero__title-line">{{ heroLines()[0] }}</span>
            <span class="hero__title-line hero__title-line--accent">{{ heroLines()[1] }}</span>
          </h1>
          <p class="hero__sub">{{ 'HOME_HERO_SUB' | tr }}</p>
          <div class="hero__actions">
            <a class="btn btn--gold btn--lg" routerLink="/movies">
              {{ 'HOME_HERO_CTA' | tr }}
              <svg class="icon-fwd" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 6l6 6-6 6" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </a>
            <a class="btn btn--line btn--lg" [routerLink]="['/movie', featured().id]">{{ 'HOME_FEATURED_CT' | tr }}</a>
          </div>
          <div class="hero__meta">
            <div class="hero__meta-item">
              <b>{{ nowShowing().length }}</b>
              <span>{{ 'MOVIES_NOW' | tr }}</span>
            </div>
            <div class="hero__meta-item">
              <b>{{ halls().length }}</b>
              <span>{{ 'HOME_HALLS' | tr }}</span>
            </div>
            <div class="hero__meta-item">
              <b>2D→3D</b>
              <span>{{ 'HOME_WHY_1_T' | tr }}</span>
            </div>
          </div>
        </div>

        <div class="hero__poster" [class.animate-in]="true" [style.animation-delay]="'.15s'">
          <div class="hero__poster-frame">
            <app-poster [art]="featured().art" [title]="featured().title | local" [year]="featured().year" />
          </div>
          <div class="hero__badge">
            <span class="hero__badge-kicker">{{ 'HOME_FEATURED_KICKER' | tr }}</span>
            <span class="hero__badge-title">{{ featured().title | local }}</span>
            <div class="hero__badge-row">
              <span class="tag tag--gold">{{ featured().badge }}</span>
              <span>{{ 'HOME_FEATURED_PRICE' | tr }} {{ featuredPrice() }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="marquee" aria-hidden="true">
        <div class="marquee__track">
          <div class="marquee__group">
            @for (m of marqueeList; track m) {
              <span>{{ m }}</span><i>·</i>
            }
          </div>
          <div class="marquee__group">
            @for (m of marqueeList; track m + 'b') {
              <span>{{ m }}</span><i>·</i>
            }
          </div>
        </div>
      </div>
    </header>

    <!-- NOW SHOWING -->
    <section class="section container" id="now">
      <div class="section-head" reveal>
        <div>
          <span class="kicker">{{ 'HOME_NOW_SHOWING_SUB' | tr }}</span>
          <h2 class="title">{{ 'HOME_NOW_SHOWING' | tr }}</h2>
        </div>
        <a class="btn btn--line btn--sm" routerLink="/movies">{{ 'AD_NAV_MOVIES' | tr }} →</a>
      </div>
      <div class="grid" reveal>
        @for (m of nowShowing(); track m.id) {
          <app-movie-card [movie]="m" />
        }
      </div>
    </section>

    <!-- COMING SOON -->
    <section class="section section--tight">
      <div class="container">
        <div class="section-head" reveal>
          <div>
            <span class="kicker">{{ 'HOME_COMING_SOON_SUB' | tr }}</span>
            <h2 class="title">{{ 'HOME_COMING_SOON' | tr }}</h2>
          </div>
        </div>
        <div class="soon-row" reveal>
          @for (m of comingSoon(); track m.id) {
            <a class="soon-card" [routerLink]="['/movie', m.id]">
              <app-poster [art]="m.art" [title]="m.title | local" [year]="m.year" />
              <div class="soon-card__body">
                <h3 class="soon-card__title">{{ m.title | local }}</h3>
                <span class="soon-card__date">{{ quickDay(m) }}</span>
                <span class="soon-card__genres">{{ genresLabel(m) }}</span>
              </div>
            </a>
          }
        </div>
      </div>
    </section>

    <!-- HALLS -->
    <section class="section">
      <div class="container">
        <div class="section-head" reveal>
          <div>
            <span class="kicker">{{ 'HOME_HALLS_SUB' | tr }}</span>
            <h2 class="title">{{ 'HOME_HALLS' | tr }}</h2>
          </div>
        </div>
        <div class="halls" reveal>
          @for (hall of halls(); track hall.id) {
            <div class="hall">
              <div class="hall__top">
                <span class="tag tag--gold">{{ hall.kind }}</span>
                <span class="hall__cap">{{ hall.rows * hall.seatsPerRow }}</span>
              </div>
              <h3 class="hall__name">{{ hall.name | local }}</h3>
              <p class="hall__desc">{{ hallDesc(hall.kind) }}</p>
              <div class="hall__foot">
                <span class="tag">{{ hall.rows }} {{ 'AD_HALL_ROWS' | tr }}</span>
                <span class="tag">{{ hall.seatsPerRow }} {{ 'AD_HALL_SEATS' | tr }}</span>
              </div>
              <a class="hall__cta" routerLink="/movies">
                {{ 'HOME_HALLS_CT' | tr }}
                <svg class="icon-fwd" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 6l6 6-6 6" stroke-linecap="round" stroke-linejoin="round"/></svg>
              </a>
            </div>
          }
        </div>
      </div>
    </section>

    <!-- WHY -->
    <section class="section why">
      <div class="container">
        <div class="section-head" reveal>
          <div>
            <span class="kicker">NOIR</span>
            <h2 class="title">{{ 'HOME_WHY' | tr }}</h2>
          </div>
        </div>
        <div class="why__grid">
          @for (f of features; track f.title) {
            <div class="why__item" reveal>
              <div class="why__num">{{ '0' + (f.index + 1) }}</div>
              <h3 class="why__title">{{ f.title }}</h3>
              <p class="why__desc">{{ f.desc }}</p>
            </div>
          }
        </div>
      </div>
    </section>

    <!-- NEWSLETTER -->
    <section class="section container">
      <div class="news" reveal>
        <div class="news__inner">
          <div>
            <span class="kicker">NOIR LIST</span>
            <h2 class="news__title">{{ 'HOME_NEWSLETTER_T' | tr }}</h2>
            <p class="news__sub">{{ 'HOME_NEWSLETTER_D' | tr }}</p>
          </div>
          <form class="news__form" (submit)="subscribe($event)">
            <input
              class="input news__input"
              type="email"
              required
              [attr.placeholder]="'HOME_NEWSLETTER_PH' | tr"
              #mail
            />
            <button type="submit" class="btn btn--gold">{{ 'HOME_NEWSLETTER_CT' | tr }}</button>
          </form>
        </div>
      </div>
    </section>
  `,
  styles: `
    .hero {
      position: relative; overflow: hidden; isolation: isolate;
      background:
        radial-gradient(90% 70% at 82% 20%, color-mix(in srgb, var(--b0) 60%, transparent), transparent 60%),
        linear-gradient(175deg, var(--b0) 0%, var(--b1) 120%);
      border-bottom: 1px solid var(--line);
    }
    .hero::after { content: ''; position: absolute; inset: 0; background: linear-gradient(180deg, rgba(8,8,10,.35), var(--bg) 96%); z-index: 0; }
    .hero__glow { position: absolute; width: 560px; height: 560px; border-radius: 50%; background: radial-gradient(circle, color-mix(in srgb, #c9a466 16%, transparent) 0%, transparent 60%); top: -160px; inset-inline-end: 6%; z-index: 0; }
    .hero__grid { position: relative; z-index: 1; display: grid; grid-template-columns: 1.15fr 0.85fr; gap: 48px; align-items: center; padding-top: clamp(40px, 7vw, 96px); padding-bottom: 64px; }
    .hero__title { font-size: clamp(42px, 6.4vw, 84px); line-height: 1.02; font-weight: 600; margin: 6px 0 20px; }
    .hero__title-line { display: block; }
    .hero__title-line--accent { font-style: italic; color: var(--gold-2); }
    .hero__sub { color: var(--text-2); font-size: clamp(15px, 1.4vw, 17px); max-width: 52ch; line-height: 1.7; }
    .hero__actions { display: flex; gap: 14px; margin-top: 32px; flex-wrap: wrap; }
    .hero__meta { display: flex; gap: 34px; margin-top: 42px; }
    .hero__meta-item { display: flex; flex-direction: column; }
    .hero__meta-item b { font-family: var(--font-display); font-size: 26px; color: var(--gold-2); }
    .hero__meta-item span { font-size: 11.5px; letter-spacing: .14em; text-transform: uppercase; color: var(--text-3); margin-top: 2px; }
    .hero__poster { position: relative; display: flex; justify-content: center; }
    .hero__poster-frame { width: min(320px, 78%); aspect-ratio: 2/3; border-radius: 18px; overflow: hidden; transform: rotate(3deg); box-shadow: var(--shadow-lg), 0 0 0 1px color-mix(in srgb, var(--gold) 30%, transparent); position: relative; }
    .hero__badge { position: absolute; bottom: -14px; inset-inline-start: 8%; background: rgba(14,14,17,.92); backdrop-filter: blur(14px); border: 1px solid var(--line-strong); border-radius: 14px; padding: 14px 18px; width: 70%; box-shadow: var(--shadow-md); }
    .hero__badge-kicker { display: block; font-size: 10px; letter-spacing: .3em; text-transform: uppercase; color: var(--gold); font-weight: 700; margin-bottom: 6px; }
    .hero__badge-title { display: block; font-family: var(--font-display); font-size: 19px; margin-bottom: 8px; }
    .hero__badge-row { display: flex; align-items: center; justify-content: space-between; gap: 10px; font-size: 12.5px; color: var(--text-2); }

    .marquee { position: relative; z-index: 1; border-top: 1px solid rgba(255,255,255,.08); padding-block: 15px; overflow: hidden; mask-image: linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent); }
    .marquee:hover .marquee__track { animation-play-state: paused; }
    .marquee__track { display: flex; width: max-content; animation: scroll 75s linear infinite; }
    .marquee__group { display: flex; align-items: center; gap: 36px; padding-inline: 18px; font-family: var(--font-display); font-size: 15px; letter-spacing: .12em; text-transform: uppercase; color: var(--text-2); }
    .marquee__group i { font-style: normal; color: var(--gold); font-size: 12px; }
    @keyframes scroll { to { transform: translateX(-50%); } }
    html[dir='rtl'] .marquee__track { animation-name: scroll-rtl; }
    @keyframes scroll-rtl { from { transform: translateX(-50%); } to { transform: translateX(0); } }

    .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 22px; }
    @media (max-width: 1080px) { .grid { grid-template-columns: repeat(3, 1fr); } }
    @media (max-width: 760px) { .grid { grid-template-columns: repeat(2, 1fr); gap: 16px; } }
    @media (max-width: 480px) { .grid { grid-template-columns: repeat(2, 1fr); gap: 12px; } }

    .soon-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 22px; }
    @media (max-width: 980px) { .soon-row { grid-template-columns: repeat(2, 1fr); } }
    @media (max-width: 560px) { .soon-row { grid-template-columns: 1fr 1fr; gap: 14px; } }
    .soon-card { position: relative; border-radius: 16px; overflow: hidden; display: block; }
    .soon-card :host ::ng-deep .poster-host { display: block; }
    .soon-card__body { position: absolute; inset-inline: 0; bottom: 0; padding: 18px; background: linear-gradient(180deg, transparent, rgba(4,4,6,.9)); }
    .soon-card__title { font-size: 17px; margin-bottom: 4px; }
    .soon-card__date { font-size: 11px; letter-spacing: .16em; text-transform: uppercase; color: var(--gold); font-weight: 700; }
    .soon-card__genres { display: block; margin-top: 4px; font-size: 12px; color: var(--text-3); }

    .halls { display: grid; grid-template-columns: repeat(4, 1fr); gap: 18px; }
    @media (max-width: 1020px) { .halls { grid-template-columns: repeat(2, 1fr); } }
    @media (max-width: 520px) { .halls { grid-template-columns: 1fr; } }
    .hall { border: 1px solid var(--line); border-radius: 16px; padding: 22px 22px 18px; background: linear-gradient(180deg, var(--surface), var(--bg-2)); position: relative; overflow: hidden; transition: border-color .3s, transform .3s var(--ease); }
    .hall::before { content: ''; position: absolute; inset: 0 0 auto; height: 3px; background: linear-gradient(90deg, var(--gold), transparent 70%); opacity: .55; }
    .hall:hover { transform: translateY(-4px); border-color: var(--line-strong); }
    .hall__top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px; }
    .hall__cap { font-family: var(--font-display); font-size: 30px; color: var(--text-2); }
    .hall__name { font-size: 21px; margin-bottom: 8px; }
    .hall__desc { color: var(--text-3); font-size: 13px; line-height: 1.65; min-height: 44px; }
    .hall__foot { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 16px; }
    .hall__cta { display: inline-flex; align-items: center; gap: 8px; margin-top: 16px; font-weight: 700; font-size: 13.5px; color: var(--gold); }
    .hall__cta:hover { color: var(--gold-2); }

    .why { background: linear-gradient(180deg, transparent, rgba(12,10,8,.35)); }
    .why__grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 18px; }
    @media (max-width: 980px) { .why__grid { grid-template-columns: 1fr 1fr; } }
    @media (max-width: 540px) { .why__grid { grid-template-columns: 1fr; } }
    .why__item { border-inline-start: 1px solid var(--line-strong); padding-inline-start: 20px; }
    .why__num { font-family: var(--font-display); font-style: italic; font-size: 44px; color: var(--gold); opacity: .9; line-height: 1; margin-bottom: 14px; }
    .why__title { font-size: 18px; margin-bottom: 8px; }
    .why__desc { color: var(--text-3); font-size: 14px; line-height: 1.7; }

    .news { border-radius: 20px; overflow: hidden; background: linear-gradient(120deg, rgba(201,164,102,.12), transparent 45%), var(--surface); border: 1px solid var(--line-strong); }
    .news__inner { display: grid; grid-template-columns: 1.2fr 1fr; gap: 28px; align-items: center; padding: clamp(28px, 5vw, 52px); }
    .news__title { font-size: clamp(24px, 3vw, 34px); margin: 2px 0 8px; }
    .news__sub { color: var(--text-2); font-size: 14.5px; }
    .news__form { display: flex; gap: 10px; }
    .news__input { flex: 1; }
    @media (max-width: 760px) {
      .hero__grid { grid-template-columns: 1fr; }
      .hero__poster { display: none; }
      .news__inner { grid-template-columns: 1fr; }
      .news__form { flex-direction: column; }
    }
  `,
})
export class HomeComponent {
  readonly features: { index: number; title: string; desc: string }[];

  constructor(
    private data: DataService,
    private i18n: I18nService,
    private toast: ToastService,
  ) {
    this.features = [
      { index: 0, title: this.i18n.t('HOME_WHY_1_T'), desc: this.i18n.t('HOME_WHY_1_D') },
      { index: 1, title: this.i18n.t('HOME_WHY_2_T'), desc: this.i18n.t('HOME_WHY_2_D') },
      { index: 2, title: this.i18n.t('HOME_WHY_3_T'), desc: this.i18n.t('HOME_WHY_3_D') },
      { index: 3, title: this.i18n.t('HOME_WHY_4_T'), desc: this.i18n.t('HOME_WHY_4_D') },
    ];
  }

  featured(): Movie {
    const list = this.data.movies().filter((m) => m.status === 'now');
    return (list.find((m) => m.favorite) ?? list[0]) ?? ({} as Movie);
  }

  heroLines(): string[] {
    const words = this.i18n.t('HOME_HERO_TITLE').trim().split(/\s+/);
    const mid = Math.ceil(words.length / 2);
    return [words.slice(0, mid).join(' '), words.slice(mid).join(' ')];
  }

  nowShowing(): Movie[] {
    return this.data.movies().filter((m) => m.status === 'now');
  }

  comingSoon(): Movie[] {
    return this.data.movies().filter((m) => m.status === 'soon');
  }

  halls() {
    return this.data.halls();
  }

  get marqueeList(): string[] {
    return this.nowShowing().map((m) => m.title[this.i18n.lang()]);
  }

  featuredPrice(): string {
    const st = this.data.showtimes().find((s) => s.movieId === this.featured().id);
    if (!st) return '';
    return new Intl.NumberFormat(this.i18n.locale(), { maximumFractionDigits: 0 }).format(
      Math.min(st.price, st.vipPrice),
    );
  }

  hallDesc(kind: string): string {
    const map: Record<string, string> = {
      IMAX: this.i18n.t('HOME_WHY_2_D'),
      '3D': this.i18n.t('SEATS_VIEW_3D'),
      VIP: this.i18n.t('SEATS_LEGEND_VIP'),
      '2D': this.i18n.t('SEATS_VIEW_2D'),
    };
    return map[kind] ?? '';
  }

  quickDay(m: Movie): string {
    return `${this.i18n.t('MV_RELEASE')} — ${m.year}`;
  }

  genresLabel(m: Movie): string {
    return m.genres.map((g) => g[this.i18n.lang()]).join(' · ');
  }

  subscribe(e: Event): void {
    e.preventDefault();
    const input = (e.currentTarget as HTMLFormElement).querySelector('input') as HTMLInputElement;
    this.toast.ok(this.i18n.t('HOME_NEWSLETTER_OK'));
    input.value = '';
  }
}