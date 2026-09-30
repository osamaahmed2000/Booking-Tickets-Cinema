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
  templateUrl: './bookings.component.html',
  styleUrl: './bookings.component.scss',
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