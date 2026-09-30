import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DataService } from '../../../core/services/data.service';
import { I18nService } from '../../../core/i18n/i18n.service';
import type { Booking } from '../../../core/models';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { MoneyPipe } from '../../../shared/pipes/money.pipe';

const DAY = 24 * 60 * 60 * 1000;

@Component({
  selector: 'admin-dashboard',
  standalone: true,
  imports: [RouterLink, TranslatePipe, MoneyPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  host: { class: 'page-admin-dash' },
})
export class AdminDashboardComponent {
  constructor(private data: DataService, private i18n: I18nService) {}

  bookings(): Booking[] {
    return this.data.bookings();
  }

  get revenue(): number {
    return this.bookings().filter((b) => b.status === 'confirmed').reduce((a, b) => a + b.total, 0);
  }

  get seatsSold(): number {
    return this.bookings().reduce((a, b) => a + b.seats.length, 0);
  }

  get avgPerBooking(): string {
    const n = this.bookings().length || 1;
    return (this.seatsSold / n).toFixed(1);
  }

  get todayCount(): number {
    const today = new Date().toISOString().slice(0, 10);
    return this.bookings().filter((b) => b.createdAt.slice(0, 10) === today).length;
  }

  get occupancy(): number {
    let cap = 0;
    let sold = 0;
    for (const st of this.data.showtimes()) {
      const hall = this.data.halls().find((h) => h.id === st.hallId);
      const capacity = hall ? hall.rows * hall.seatsPerRow : 1;
      cap += capacity;
      sold += st.bookedSeats.length;
    }
    return cap ? Math.round((sold / cap) * 100) : 0;
  }

  get gridLines(): { y: number }[] {
    return [0, 1, 2, 3].map((i) => ({ y: 30 + i * 50 }));
  }

  get series(): { i: number; x: number; y: number; w: number; h: number; short: string; label: string }[] {
    const days = 7;
    const W = 528;
    const H = 200;
    const gap = 14;
    const bw = (W - gap * (days - 1)) / days;
    const labels: string[] = [];
    const values: number[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(Date.now() - i * DAY);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const v = this.bookings().filter((b) => b.createdAt.slice(0, 10) === key).reduce((a, b) => a + b.total, 0);
      values.push(v);
      labels.push(
        new Intl.DateTimeFormat(this.i18n.locale(), { weekday: 'short' }).format(d),
      );
    }
    const max = Math.max(...values, 1);
    return values.map((v, i) => {
      const h = Math.max((v / max) * H, v > 0 ? 8 : 3);
      return {
        i,
        x: i * (bw + gap),
        y: H - h + 24,
        w: bw,
        h,
        short: v > 0 ? this.i18n.t('SEATS_TOTAL') && v >= 1000 ? `${Math.round(v / 1000)}k` : String(Math.round(v)) : '0',
        label: labels[i],
      };
    });
  }

  get bestSellers(): { movieId: string; title: string; count: number; pct: number }[] {
    const map = new Map<string, number>();
    for (const b of this.bookings()) {
      map.set(b.movieId, (map.get(b.movieId) ?? 0) + b.seats.length);
    }
    const arr = [...map.entries()]
      .map(([movieId, count]) => ({
        movieId,
        title: this.data.movies().find((m) => m.id === movieId)?.title[this.i18n.lang()] ?? movieId,
        count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
    const max = Math.max(...arr.map((a) => a.count), 1);
    return arr.map((a) => ({ ...a, pct: Math.round((a.count / max) * 100) }));
  }

  movie(b: Booking): string {
    return this.data.movies().find((m) => m.id === b.movieId)?.title[this.i18n.lang()] ?? '—';
  }

  get latest(): Booking[] {
    return this.bookings().slice(0, 5);
  }
}