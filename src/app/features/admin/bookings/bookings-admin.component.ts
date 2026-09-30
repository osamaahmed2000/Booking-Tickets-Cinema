import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { DataService } from '../../../core/services/data.service';
import { I18nService } from '../../../core/i18n/i18n.service';
import { ToastService } from '../../../core/services/toast.service';
import type { Booking, BookingStatus } from '../../../core/models';
import { ModalComponent } from '../../../shared/ui/modal.component';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { DayShortPipe } from '../../../shared/pipes/date.pipe';
import { MoneyPipe } from '../../../shared/pipes/money.pipe';

@Component({
  selector: 'admin-bookings',
  standalone: true,
  imports: [ModalComponent, TranslatePipe, DayShortPipe, MoneyPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './bookings-admin.component.html',
  styleUrl: './bookings-admin.component.scss',
  host: { class: 'page-admin-crud' },
})
export class BookingsAdminComponent {
  readonly filter = signal<BookingStatus | 'all'>('all');
  readonly target = signal<Booking | null>(null);

  constructor(
    private data: DataService,
    private i18n: I18nService,
    private toast: ToastService,
  ) {}

  get filters() {
    return [
      { key: 'all' as const, label: this.i18n.t('AD_BK_FILTER_ALL') },
      { key: 'confirmed' as const, label: this.i18n.t('AD_BK_FILTER_CONF') },
      { key: 'cancelled' as const, label: this.i18n.t('AD_BK_FILTER_CANCEL') },
    ];
  }

  items(): Booking[] {
    const f = this.filter();
    return this.data.bookings().filter((b) => (f === 'all' ? true : b.status === f));
  }

  movieTitle(b: Booking): string {
    return this.data.movies().find((m) => m.id === b.movieId)?.title[this.i18n.lang()] ?? '—';
  }

  show(b: Booking): string {
    const st = this.data.showtimes().find((s) => s.id === b.showtimeId);
    if (!st) return '—';
    return `${st.dateISO} · ${st.time}`;
  }

  askCancel(b: Booking): void {
    this.target.set(b);
  }

  confirmCancel(): void {
    const b = this.target();
    if (!b) return;
    this.data.cancelBooking(b.id);
    this.target.set(null);
    this.toast.ok(this.i18n.t('TOAST_DELETED'));
  }
}