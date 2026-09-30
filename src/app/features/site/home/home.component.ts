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
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
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