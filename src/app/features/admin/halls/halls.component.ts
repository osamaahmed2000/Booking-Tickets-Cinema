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
  template: `
    <div class="page-head animate-in">
      <div>
        <span class="kicker">{{ 'AD_NAV_HALLS' | tr }}</span>
        <h1 class="page-head__title">{{ 'AD_HALL_TITLE' | tr }}</h1>
      </div>
      <button type="button" class="btn btn--gold btn--sm" (click)="openNew()">+ {{ 'AD_HALL_ADD' | tr }}</button>
    </div>

    @if (halls().length === 0) {
      <div class="card empty-note" style="padding-block:70px">{{ 'AD_HALL_NO' | tr }}</div>
    } @else {
      <div class="hall-grid">
        @for (h of halls(); track h.id) {
          <div class="hall card">
            <div class="hall__head">
              <div>
                <span class="tag tag--gold">{{ h.kind }}</span>
                <h3 class="hall__name">{{ h.name | local }}</h3>
              </div>
              <span class="hall__cap">{{ h.rows * h.seatsPerRow }}</span>
            </div>
            <div class="hall__rows">
              @for (r of seatRows(h); track r) {
                <div class="hall__row">
                  @for (c of seatCols(h); track $index) {
                    @if (isAisleAfter(h, $index + 1)) { <span style="width:8px"></span> }
                    <span class="seat-dot" [class.vip]="isVipRow(h, r)"></span>
                  }
                </div>
              }
            </div>
            <div class="hall__stats">
              <span>{{ h.rows }} {{ 'AD_HALL_ROWS' | tr }}</span>
              <span>{{ h.seatsPerRow }} {{ 'AD_HALL_SEATS' | tr }}</span>
              <span>{{ h.vipRows }} VIP</span>
            </div>
            <div class="hall__actions">
              <button type="button" class="btn btn--dark btn--sm" (click)="openEdit(h)">{{ 'C_EDIT' | tr }}</button>
              <button type="button" class="btn btn--ghost btn--sm" (click)="askDelete(h)">{{ 'C_DELETE' | tr }}</button>
            </div>
          </div>
        }
      </div>
    }

    <app-modal [open]="formOpen()" [title]="editingId() ? ('AD_HALL_SAVE' | tr) : ('AD_HALL_ADD' | tr)" (close)="formOpen.set(false)">
      <form [formGroup]="form" class="hall-form">
        <div class="form-row">
          <div class="field" style="min-width:0">
            <label>{{ 'AD_HALL_NAME_EN' | tr }}</label>
            <input class="input" formControlName="nameEn" />
          </div>
          <div class="field" style="min-width:0">
            <label>{{ 'AD_HALL_NAME_AR' | tr }}</label>
            <input class="input" formControlName="nameAr" />
          </div>
        </div>
        <div class="form-row">
          <div class="field" style="min-width:0">
            <label>{{ 'AD_HALL_KIND' | tr }}</label>
            <select class="select" formControlName="kind">
              @for (k of kinds; track k) { <option [value]="k">{{ k }}</option> }
            </select>
          </div>
          <div class="field" style="min-width:0">
            <label>{{ 'AD_HALL_CAP' | tr }}</label>
            <span class="cap" style="display:block; padding-top:12px; color: var(--gold); font-weight:700">{{ capacity }}</span>
          </div>
        </div>
        <div class="form-row">
          <div class="field" style="min-width:0">
            <label>{{ 'AD_HALL_ROWS' | tr }}</label>
            <input class="input" type="number" min="3" max="16" formControlName="rows" />
          </div>
          <div class="field" style="min-width:0">
            <label>{{ 'AD_HALL_SEATS' | tr }}</label>
            <input class="input" type="number" min="4" max="24" formControlName="seats" />
          </div>
          <div class="field" style="min-width:0">
            <label>{{ 'AD_HALL_VIP' | tr }}</label>
            <input class="input" type="number" min="0" formControlName="vip" />
          </div>
        </div>
        <div class="field">
          <label>{{ 'AD_HALL_AISLES' | tr }}</label>
          <input class="input" formControlName="aisles" placeholder="4, 9" />
        </div>
        <div class="preview-box">
          <span class="kicker">{{ 'AD_HALL_PREVIEW' | tr }}</span>
          <app-seat-map [hall]="previewHall" [interactive]="false" />
        </div>
        <div class="modal-actions" style="margin-top:16px">
          <button type="button" class="btn btn--line" (click)="formOpen.set(false)">{{ 'C_CANCEL' | tr }}</button>
          <button type="button" class="btn btn--gold" (click)="save()">{{ 'AD_HALL_SAVE' | tr }}</button>
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
    .hall-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 16px; }
    .hall { padding: 20px; }
    .hall__head { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; }
    .hall__name { font-size: 18px; margin-top: 8px; }
    .hall__cap { font-family: var(--font-display); font-size: 30px; color: var(--gold-2); }
    .hall__rows { display: flex; flex-direction: column; gap: 4px; padding: 12px; background: var(--bg); border-radius: 10px; overflow: hidden; }
    .hall__row { display: flex; gap: 3px; justify-content: center; }
    .seat-dot { width: 8px; height: 8px; border-radius: 2px; background: rgba(255,255,255,.18); }
    .seat-dot.vip { background: var(--gold); }
    .hall__stats { display: flex; gap: 14px; color: var(--text-3); font-size: 12.5px; margin: 14px 0; }
    .hall__actions { display: flex; gap: 8px; }
    .preview-box { margin-top: 18px; }
    .preview-box app-seat-map { display: block; }
    :host ::ng-deep .seat-view__tabs { display: none !important; }
    :host ::ng-deep .map2d { background: var(--bg); border: 0; padding: 12px; border-radius: 10px; }
    .modal-actions { display: flex; gap: 10px; justify-content: flex-end; }
  `,
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