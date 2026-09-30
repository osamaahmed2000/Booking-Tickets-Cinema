import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { DataService } from '../../../core/services/data.service';
import { I18nService } from '../../../core/i18n/i18n.service';
import { ToastService } from '../../../core/services/toast.service';
import type { Showtime } from '../../../core/models';
import { makeId } from '../../../core/utils';
import { ModalComponent } from '../../../shared/ui/modal.component';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { LocalizePipe } from '../../../shared/pipes/localize.pipe';
import { ClockPipe } from '../../../shared/pipes/date.pipe';

@Component({
  selector: 'admin-showtimes',
  standalone: true,
  imports: [ReactiveFormsModule, ModalComponent, TranslatePipe, LocalizePipe, ClockPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page-head animate-in">
      <div>
        <span class="kicker">{{ 'AD_NAV_SHOWTIMES' | tr }}</span>
        <h1 class="page-head__title">{{ 'AD_ST_TITLE' | tr }}</h1>
      </div>
      <button type="button" class="btn btn--gold btn--sm" (click)="openNew()">+ {{ 'AD_ST_ADD' | tr }}</button>
    </div>

    <div class="filter animate-in">
      <button type="button" class="chip" [class.active]="filterMovie() === ''" (click)="filterMovie.set('')">{{ 'C_ALL' | tr }}</button>
      @for (m of movies(); track m.id) {
        <button type="button" class="chip" [class.active]="filterMovie() === m.id" (click)="filterMovie.set(m.id)">
          {{ m.title | local }}
        </button>
      }
    </div>

    @if (items().length === 0) {
      <div class="card empty-note" style="padding-block:70px">{{ 'AD_ST_NO' | tr }}</div>
    } @else {
      <div class="card tbl">
        @for (st of items(); track st.id) {
          <div class="row">
            <div class="rf">
              <span class="rf__movie">{{ movieTitle(st) }}</span>
              <span class="rf__hall">{{ hallName(st) }} · <em>{{ hallKind(st) }}</em></span>
            </div>
            <div class="rd">
              <b>{{ st.dateISO }}</b>
              <span>{{ st.time | clock }}</span>
            </div>
            <div class="rp">
              <span>{{ 'AD_ST_PRICE' | tr }}: <b>{{ st.price }}</b></span>
              <span>{{ 'AD_ST_VIP' | tr }}: <b>{{ st.vipPrice }}</b></span>
            </div>
            <div class="rb">
              <span class="tag" [class.tag--green]="st.bookedSeats.length > 0">
                {{ st.bookedSeats.length }} {{ 'AD_ST_BOOKED' | tr }}
              </span>
            </div>
            <div class="ra">
              <button type="button" class="btn btn--ghost btn--sm" (click)="openEdit(st)">{{ 'C_EDIT' | tr }}</button>
              <button type="button" class="btn btn--ghost btn--sm" (click)="askDelete(st)">{{ 'C_DELETE' | tr }}</button>
            </div>
          </div>
        }
      </div>
    }

    <app-modal [open]="formOpen()" [title]="editingId() ? 'Edit showtime' : ('AD_ST_ADD' | tr)" (close)="formOpen.set(false)">
      <form [formGroup]="form">
        <div class="field">
          <label>{{ 'AD_ST_MOVIE' | tr }}</label>
          <select class="select" formControlName="movieId">
            @for (m of movies(); track m.id) { <option [value]="m.id">{{ m.title | local }}</option> }
          </select>
        </div>
        <div class="field">
          <label>{{ 'AD_ST_HALL' | tr }}</label>
          <select class="select" formControlName="hallId">
            @for (h of halls(); track h.id) { <option [value]="h.id">{{ h.name | local }} — {{ h.kind }}</option> }
          </select>
        </div>
        <div class="form-row">
          <div class="field" style="min-width:0">
            <label>{{ 'AD_ST_DATE' | tr }}</label>
            <input class="input" type="date" formControlName="date" />
          </div>
          <div class="field" style="min-width:0">
            <label>{{ 'AD_ST_TIME' | tr }}</label>
            <input class="input" type="time" formControlName="time" />
          </div>
        </div>
        <div class="form-row">
          <div class="field" style="min-width:0">
            <label>{{ 'AD_ST_PRICE' | tr }}</label>
            <input class="input" type="number" min="0" formControlName="price" />
          </div>
          <div class="field" style="min-width:0">
            <label>{{ 'AD_ST_VIP' | tr }}</label>
            <input class="input" type="number" min="0" formControlName="vip" />
          </div>
        </div>
        <div class="modal-actions" style="margin-top:16px">
          <button type="button" class="btn btn--line" (click)="formOpen.set(false)">{{ 'C_CANCEL' | tr }}</button>
          <button type="button" class="btn btn--gold" (click)="save()">{{ 'C_SAVE' | tr }}</button>
        </div>
      </form>
    </app-modal>

    <app-modal [open]="target() !== null" [title]="'C_DELETE_TITLE' | tr" (close)="target.set(null)">
      <p style="color: var(--text-2); margin-bottom: 20px;">{{ 'C_DELETE_BODY' | tr }}</p>
      <div class="modal-actions">
        <button type="button" class="btn btn--line" (click)="target.set(null)">{{ 'C_CANCEL' | tr }}</button>
        <button type="button" class="btn btn--danger" (click)="confirmDelete()">{{ 'C_YES' | tr }}</button>
      </div>
    </app-modal>
  `,
  styles: `
    .page-head { display: flex; align-items: flex-end; justify-content: space-between; gap: 16px; margin-bottom: 24px; flex-wrap: wrap; }
    .page-head__title { font-size: clamp(26px, 4vw, 38px); }
    .filter { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 18px; }
    .tbl { padding: 6px 0; }
    .row { display: grid; grid-template-columns: 1.4fr 1fr 1fr 140px auto; gap: 16px; align-items: center; padding: 16px 20px; border-top: 1px solid var(--line); font-size: 13.5px; }
    .row:first-child { border-top: 0; }
    .rf { display: flex; flex-direction: column; gap: 4px; }
    .rf__movie { font-weight: 700; }
    .rf__hall { color: var(--text-3); font-size: 12.5px; }
    .rf__hall em { font-style: normal; color: var(--gold); }
    .rd { display: flex; flex-direction: column; gap: 3px; text-transform: capitalize; }
    .rd b { font-weight: 600; }
    .rd span { color: var(--text-3); font-size: 12.5px; }
    .rp { display: flex; flex-direction: column; gap: 3px; color: var(--text-3); font-size: 12.5px; }
    .rp b { color: var(--text); }
    .ra { display: flex; gap: 6px; justify-content: flex-end; }
    @media (max-width: 820px) {
      .row { grid-template-columns: 1fr 1fr; }
      .rp, .rb { display: none; }
    }
    .modal-actions { display: flex; gap: 10px; justify-content: flex-end; }
  `,
  host: { class: 'page-admin-crud' },
})
export class ShowtimesComponent {
  readonly filterMovie = signal('');
  readonly formOpen = signal(false);
  readonly editingId = signal('');
  readonly target = signal<Showtime | null>(null);
  readonly form!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private data: DataService,
    private i18n: I18nService,
    private toast: ToastService,
  ) {
    this.form = this.fb.group({
      movieId: [''],
      hallId: [''],
      date: [this.today()],
      time: ['19:30'],
      price: [100],
      vip: [220],
    });
  }

  private today(): string {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  movies() {
    return this.data.movies();
  }

  halls() {
    return this.data.halls();
  }

  items(): Showtime[] {
    const f = this.filterMovie();
    return this.data
      .showtimes()
      .filter((s) => (f ? s.movieId === f : true))
      .sort((a, b) => a.dateISO.localeCompare(b.dateISO) || a.time.localeCompare(b.time));
  }

  movieTitle(st: Showtime): string {
    return this.movies().find((m) => m.id === st.movieId)?.title[this.i18n.lang()] ?? '—';
  }

  hallName(st: Showtime): string {
    return this.halls().find((h) => h.id === st.hallId)?.name[this.i18n.lang()] ?? '—';
  }

  hallKind(st: Showtime): string {
    return this.halls().find((h) => h.id === st.hallId)?.kind ?? '';
  }

  openNew(): void {
    this.editingId.set('');
    const firstMovie = this.movies().find((m) => m.status === 'now') ?? this.movies()[0];
    this.form.reset({
      movieId: firstMovie?.id ?? '',
      hallId: this.halls()[0]?.id ?? '',
      date: this.today(),
      time: '19:30',
      price: 100,
      vip: 220,
    });
    this.formOpen.set(true);
  }

  openEdit(st: Showtime): void {
    this.editingId.set(st.id);
    this.form.patchValue({
      movieId: st.movieId,
      hallId: st.hallId,
      date: st.dateISO,
      time: st.time,
      price: st.price,
      vip: st.vipPrice,
    });
    this.formOpen.set(true);
  }

  save(): void {
    const v = this.form.value;
    if (!v.movieId || !v.hallId || !v.date || !v.time) return;
    const st: Showtime = {
      id: this.editingId() || makeId('st'),
      movieId: v.movieId,
      hallId: v.hallId,
      dateISO: v.date,
      time: v.time,
      price: Math.max(0, Number(v.price) || 0),
      vipPrice: Math.max(0, Number(v.vip) || 0),
      bookedSeats: this.editingId() ? this.data.showtimes().find((s) => s.id === this.editingId())?.bookedSeats ?? [] : [],
    };
    this.data.saveShowtime(st);
    this.formOpen.set(false);
    this.toast.ok(this.i18n.t(this.editingId() ? 'TOAST_UPDATED' : 'TOAST_ADDED'));
  }

  askDelete(st: Showtime): void {
    this.target.set(st);
  }

  confirmDelete(): void {
    const st = this.target();
    if (!st) return;
    this.data.deleteShowtime(st.id);
    this.target.set(null);
    this.toast.ok(this.i18n.t('TOAST_DELETED'));
  }
}