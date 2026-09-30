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
  templateUrl: './movie-details.component.html',
  styleUrl: './movie-details.component.scss',
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