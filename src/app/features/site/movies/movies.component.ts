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
  templateUrl: './movies.component.html',
  styleUrl: './movies.component.scss',
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