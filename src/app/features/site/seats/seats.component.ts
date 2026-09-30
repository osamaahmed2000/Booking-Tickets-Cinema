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
  templateUrl: './seats.component.html',
  styleUrl: './seats.component.scss',
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

  get currency(): string {
    return this.data.settings().currency;
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