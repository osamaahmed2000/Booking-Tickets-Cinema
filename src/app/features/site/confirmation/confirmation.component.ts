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
  templateUrl: './confirmation.component.html',
  styleUrl: './confirmation.component.scss',
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