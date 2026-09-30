import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { DataService } from '../../../core/services/data.service';
import { I18nService } from '../../../core/i18n/i18n.service';
import { ToastService } from '../../../core/services/toast.service';
import type { CinemaHall, HallKind } from '../../../core/models';
import { makeId } from '../../../core/utils';
import { ModalComponent } from '../../../shared/ui/modal.component';
import { SeatMapComponent } from '../../../shared/ui/seat-map.component';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { LocalizePipe } from '../../../shared/pipes/localize.pipe';

const KINDS: HallKind[] = ['IMAX', '3D', '2D', 'VIP'];

@Component({
  selector: 'admin-halls',
  standalone: true,
  imports: [ReactiveFormsModule, ModalComponent, SeatMapComponent, TranslatePipe, LocalizePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './halls.component.html',
  styleUrl: './halls.component.scss',
  host: { class: 'page-admin-crud' },
})
export class HallsComponent {
  readonly kinds = KINDS;
  readonly formOpen = signal(false);
  readonly editingId = signal('');
  readonly target = signal<CinemaHall | null>(null);
  readonly form!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private data: DataService,
    private i18n: I18nService,
    private toast: ToastService,
  ) {
    this.form = this.fb.group({
      nameEn: [''],
      nameAr: [''],
      kind: ['2D'],
      rows: [8],
      seats: [12],
      vip: [1],
      aisles: ['4, 8'],
    });
  }

  halls() {
    return this.data.halls();
  }

  openNew(): void {
    this.editingId.set('');
    this.form.reset({ nameEn: '', nameAr: '', kind: '2D', rows: 8, seats: 12, vip: 1, aisles: '4, 8' });
    this.formOpen.set(true);
  }

  openEdit(h: CinemaHall): void {
    this.editingId.set(h.id);
    this.form.patchValue({
      nameEn: h.name.en,
      nameAr: h.name.ar,
      kind: h.kind,
      rows: h.rows,
      seats: h.seatsPerRow,
      vip: h.vipRows,
      aisles: h.aislesAfter.join(', '),
    });
    this.formOpen.set(true);
  }

  get capacity(): number {
    return (Number(this.form.value.rows) || 0) * (Number(this.form.value.seats) || 0);
  }

  get previewHall(): CinemaHall {
    const v = this.form.value;
    return {
      id: 'preview',
      name: { en: v.nameEn || 'Preview', ar: v.nameAr || 'معاينة' },
      kind: (v.kind as HallKind) || '2D',
      rows: Math.max(3, Number(v.rows) || 8),
      seatsPerRow: Math.max(4, Number(v.seats) || 12),
      vipRows: Math.max(0, Number(v.vip) || 1),
      aislesAfter: String(v.aisles ?? '').split(',').map((s: string) => Number(s.trim())).filter((n: number) => n > 0 && n <= 24),
    };
  }

  seatRows(h: CinemaHall): string[] {
    return Array.from({ length: h.rows }, (_, i) => String.fromCharCode(65 + i));
  }

  seatCols(h: CinemaHall): number[] {
    return Array.from({ length: h.seatsPerRow }, (_, i) => i + 1);
  }

  isVipRow(h: CinemaHall, row: string): boolean {
    const idx = row.charCodeAt(0) - 65;
    return idx >= h.rows - h.vipRows;
  }

  isAisleAfter(h: CinemaHall, col: number): boolean {
    return h.aislesAfter.includes(col);
  }

  save(): void {
    const v = this.form.value;
    const aisles = String(v.aisles ?? '').split(',').map((s: string) => Number(s.trim())).filter((n: number) => n > 0);
    const hall: CinemaHall = {
      id: this.editingId() || makeId('hall'),
      name: { en: v.nameEn || 'Hall', ar: v.nameAr || (v.nameEn || 'قاعة') },
      kind: (v.kind as HallKind) || '2D',
      rows: Math.max(3, Number(v.rows) || 8),
      seatsPerRow: Math.max(4, Number(v.seats) || 12),
      vipRows: Math.min(Math.max(0, Number(v.vip) || 1), Math.max(3, Number(v.rows) || 8)),
      aislesAfter: aisles,
    };
    this.data.saveHall(hall);
    this.formOpen.set(false);
    this.toast.ok(this.i18n.t(this.editingId() ? 'TOAST_UPDATED' : 'TOAST_ADDED'));
  }

  askDelete(h: CinemaHall): void {
    this.target.set(h);
  }

  confirmDelete(): void {
    const h = this.target();
    if (!h) return;
    this.data.deleteHall(h.id);
    this.target.set(null);
    this.toast.ok(this.i18n.t('TOAST_DELETED'));
  }
}