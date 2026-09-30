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
  templateUrl: './showtimes.component.html',
  styleUrl: './showtimes.component.scss',
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