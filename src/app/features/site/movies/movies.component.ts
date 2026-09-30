import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DataService } from '../../../core/services/data.service';
import { I18nService } from '../../../core/i18n/i18n.service';
import type { Movie, MovieStatus } from '../../../core/models';
import { MovieCardComponent } from '../../../shared/ui/movie-card.component';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';

@Component({
  selector: 'page-movies',
  standalone: true,
  imports: [MovieCardComponent, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="container section section--tight">
      <div class="movies-head animate-in">
        <div>
          <span class="kicker">{{ 'MOVIES_SUB' | tr }}</span>
          <h1 class="movies-head__title">{{ 'MOVIES_TITLE' | tr }}</h1>
        </div>
        <div class="movies-head__ops">
          <div class="search">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" stroke-linecap="round" />
            </svg>
            <input
              class="search__input"
              type="search"
              [value]="query()"
              (input)="onSearch($event)"
              [attr.placeholder]="'MOVIES_SEARCH' | tr"
            />
          </div>
        </div>
      </div>

      <div class="tabs animate-in" role="tablist">
        @for (tab of statusTabs; track tab.key) {
          <button
            type="button"
            class="chip"
            [class.active]="status() === tab.key"
            (click)="setStatus(tab.key)"
          >{{ tab.label }}</button>
        }
      </div>

      @if (genres().length > 1) {
        <div class="genre-bar animate-in" [style.animation-delay]="'.06s'">
          <button type="button" class="genre-chip" [class.active]="genre() === ''" (click)="genre.set('')">{{ 'MOVIES_ALL' | tr }}</button>
          @for (g of genres(); track g) {
            <button type="button" class="genre-chip" [class.active]="genre() === g" (click)="genre.set(g)">{{ g }}</button>
          }
        </div>
      }

      <div class="grid" [style.margin-top]="'26px'">
        @for (m of filtered(); track m.id) {
          <app-movie-card [movie]="m" />
        }
      </div>

      @if (filtered().length === 0) {
        <div class="empty-note" style="padding-block: 80px;">{{ 'MOVIES_EMPTY' | tr }}</div>
      }
    </section>
  `,
  styles: `
    .movies-head { display: flex; align-items: flex-end; justify-content: space-between; gap: 20px; flex-wrap: wrap; }
    .movies-head__title { font-size: clamp(32px, 5vw, 52px); }
    .search { position: relative; }
    .search svg { position: absolute; inset-inline-start: 14px; top: 50%; transform: translateY(-50%); color: var(--text-3); }
    .search__input { width: min(280px, 70vw); background: var(--surface); border: 1px solid var(--line-strong); border-radius: 999px; padding: 12px 20px 12px 40px; color: var(--text); font-size: 14px; }
    .search__input::placeholder { color: var(--text-3); }
    .search__input:focus { outline: none; border-color: var(--gold); box-shadow: 0 0 0 3px var(--gold-dim); }
    html[dir='rtl'] .search svg { inset-inline-end: 14px; inset-inline-start: auto; transform: translateY(-50%) scaleX(-1); }
    html[dir='rtl'] .search__input { padding: 12px 40px 12px 20px; }

    .tabs { display: flex; gap: 10px; margin-top: 30px; flex-wrap: wrap; }
    .genre-bar { display: flex; gap: 8px; margin-top: 18px; flex-wrap: wrap; }
    .genre-chip { border: 1px solid var(--line); background: transparent; color: var(--text-3); font-size: 12.5px; font-weight: 600; padding: 7px 14px; border-radius: 999px; transition: all .2s; }
    .genre-chip:hover { color: var(--text); border-color: var(--line-strong); }
    .genre-chip.active { color: var(--gold); border-color: rgba(201,164,102,.45); background: var(--gold-dim); }

    .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 22px; }
    @media (max-width: 1080px) { .grid { grid-template-columns: repeat(3, 1fr); } }
    @media (max-width: 760px) { .grid { grid-template-columns: repeat(2, 1fr); gap: 16px; } }
    @media (max-width: 480px) { .grid { grid-template-columns: 1fr 1fr; gap: 12px; } }
  `,
})
export class MoviesComponent {
  readonly query = signal('');
  readonly genre = signal('');
  readonly status = signal<MovieStatus | 'all'>('all');

  onSearch(e: Event): void {
    this.query.set((e.target as HTMLInputElement).value);
  }

  constructor(
    private data: DataService,
    private i18n: I18nService,
    route: ActivatedRoute,
    private router: Router,
  ) {
    route.queryParamMap.subscribe((q) => {
      const s = q.get('status');
      if (s === 'soon' || s === 'now') this.status.set(s);
    });
  }

  get statusTabs() {
    return [
      { key: 'all' as const, label: this.i18n.t('MOVIES_ALL') },
      { key: 'now' as const, label: this.i18n.t('MOVIES_NOW') },
      { key: 'soon' as const, label: this.i18n.t('MOVIES_SOON') },
    ];
  }

  setStatus(s: MovieStatus | 'all'): void {
    this.status.set(s);
    this.router.navigate([], { queryParams: s === 'all' ? {} : { status: s } });
  }

  genres(): string[] {
    const lang = this.i18n.lang();
    const set = new Set<string>();
    for (const m of this.data.movies()) {
      for (const g of m.genres) set.add(g[lang]);
    }
    return [...set].sort();
  }

  filtered(): Movie[] {
    const q = this.query().trim().toLowerCase();
    const lang = this.i18n.lang();
    const g = this.genre();
    const s = this.status();
    return this.data
      .movies()
      .filter((m) => (s === 'all' ? true : m.status === s))
      .filter((m) => !g || m.genres.some((gd) => gd[lang] === g))
      .filter((m) => !q || m.title[lang].toLowerCase().includes(q) || m.tagline[lang].toLowerCase().includes(q));
  }
}