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
  template: `
    <div class="page-head animate-in">
      <div>
        <span class="kicker">{{ 'AD_NAV_BOOKINGS' | tr }}</span>
        <h1 class="page-head__title">{{ 'AD_BK_TITLE' | tr }}</h1>
      </div>
    </div>

    <div class="filter animate-in">
      @for (f of filters; track f.key) {
        <button type="button" class="chip" [class.active]="filter() === f.key" (click)="filter.set(f.key)">{{ f.label }}</button>
      }
      <span class="filter__count">{{ items().length }} {{ 'AD_DASH_BOOKINGS' | tr }}</span>
    </div>

    @if (items().length === 0) {
      <div class="card empty-note" style="padding-block:70px">{{ 'AD_BK_NO' | tr }}</div>
    } @else {
      <div class="card tbl">
        @for (b of items(); track b.id) {
          <div class="row">
            <div class="col-code">
              <b>{{ b.code }}</b>
              <span>{{ b.createdAt | dayShort }}</span>
            </div>
            <div class="col-cust">
              <b>{{ b.customer.name }}</b>
              <span>{{ b.customer.email }}</span>
            </div>
            <div class="col-mov">
              <span class="movie">{{ movieTitle(b) }}</span>
              <span class="show">{{ show(b) }}</span>
            </div>
            <div class="col-seats">
              @for (s of b.seats; track s) { <i>{{ s }}</i> }
            </div>
            <div class="col-total">
              <b>{{ b.total | money }}</b>
              <span>{{ b.payment }}</span>
            </div>
            <div class="col-status">
              <span class="badge" [class.badge--ok]="b.status === 'confirmed'" [class.badge--err]="b.status === 'cancelled'">
                {{ b.status === 'confirmed' ? ('MB_STATUS_CONFIRMED' | tr) : ('MB_STATUS_CANCELLED' | tr) }}
              </span>
            </div>
            <div class="col-actions">
              @if (b.status === 'confirmed') {
                <button type="button" class="btn btn--ghost btn--sm" (click)="askCancel(b)">{{ 'AD_BK_CANCEL' | tr }}</button>
              }
            </div>
          </div>
        }
      </div>
    }

    <app-modal [open]="target() !== null" [title]="'AD_BK_CANCEL' | tr" (close)="target.set(null)">
      <p style="color: var(--text-2); margin-bottom: 20px;">{{ 'MB_CANCEL_CONFIRM' | tr }}</p>
      <div class="modal-actions">
        <button type="button" class="btn btn--line" (click)="target.set(null)">{{ 'C_CANCEL' | tr }}</button>
        <button type="button" class="btn btn--danger" (click)="confirmCancel()">{{ 'C_YES' | tr }}</button>
      </div>
    </app-modal>
  `,
  styles: `
    .page-head { display: flex; align-items: flex-end; justify-content: space-between; gap: 16px; margin-bottom: 24px; flex-wrap: wrap; }
    .page-head__title { font-size: clamp(26px, 4vw, 38px); }
    .filter { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; margin-bottom: 18px; }
    .filter__count { margin-inline-start: auto; color: var(--text-3); font-size: 13px; font-weight: 600; }
    .tbl { padding: 6px 0; }
    .row { display: grid; grid-template-columns: 120px 1.2fr 1.4fr 130px 90px 100px auto; gap: 14px; align-items: center; padding: 15px 20px; border-top: 1px solid var(--line); font-size: 13.5px; }
    .row:first-child { border-top: 0; }
    .col-code { display: flex; flex-direction: column; gap: 2px; }
    .col-code b { color: var(--gold); letter-spacing: .04em; }
    .col-code span { font-size: 11px; color: var(--text-3); text-transform: capitalize; }
    .col-cust { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
    .col-cust b { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .col-cust span { font-size: 11.5px; color: var(--text-3); overflow: hidden; text-overflow: ellipsis; }
    .col-mov { display: flex; flex-direction: column; gap: 3px; min-width: 0; }
    .col-mov .movie { font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .col-mov .show { font-size: 11.5px; color: var(--text-3); text-transform: capitalize; }
    .col-seats { display: flex; flex-wrap: wrap; gap: 4px; }
    .col-seats i { font-style: normal; font-size: 11px; font-weight: 700; color: var(--gold); background: var(--gold-dim); border: 1px solid rgba(201,164,102,.3); padding: 2px 7px; border-radius: 5px; }
    .col-total { display: flex; flex-direction: column; gap: 2px; }
    .col-total b { font-weight: 700; }
    .col-total span { font-size: 10.5px; color: var(--text-3); text-transform: uppercase; letter-spacing: .06em; }
    .badge { display: inline-flex; padding: 4px 10px; border-radius: 999px; font-size: 11px; font-weight: 700; white-space: nowrap; }
    .badge--ok { color: var(--green); background: rgba(134,181,141,.1); border: 1px solid rgba(134,181,141,.3); }
    .badge--err { color: var(--red); background: rgba(217,119,106,.1); border: 1px solid rgba(217,119,106,.3); }
    .col-actions { display: flex; justify-content: flex-end; }
    .modal-actions { display: flex; gap: 10px; justify-content: flex-end; }
    @media (max-width: 1000px) {
      .row { grid-template-columns: 1fr 1fr; }
      .col-seats, .col-total { display: none; }
    }
  `,
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