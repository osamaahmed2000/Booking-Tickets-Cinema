import { ChangeDetectionStrategy, Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import type { CinemaHall } from '../../core/models';
import { isAisle } from '../../core/utils';
import { TranslatePipe } from '../pipes/translate.pipe';

type ViewKind = '2d' | '3d';
type SeatState = 'available' | 'vip' | 'selected' | 'taken';

interface SeatCell {
  code: string;
  col: number;
  state: SeatState;
}

interface RowModel {
  label: string;
  isVip: boolean;
  seats: SeatCell[];
}

@Component({
  selector: 'app-seat-map',
  standalone: true,
  imports: [TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (hall) {
      <div class="seat-view">
        <!-- view toggle -->
        <div class="seat-view__tabs">
          <button type="button" [class.active]="view() === '2d'" (click)="setView('2d')">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><rect x="7" y="7" width="10" height="10" rx="1"/></svg>
            {{ 'SEATS_VIEW_2D' | tr }}
          </button>
          <button type="button" [class.active]="view() === '3d'" (click)="setView('3d')">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l9 5v10l-9 5-9-5V7z"/><path d="M3 7l9 5 9-5M12 12v10"/></svg>
            {{ 'SEATS_VIEW_3D' | tr }}
          </button>
        </div>

        @if (view() === '2d') {
          <div class="map2d">
            <div class="screen bar">
              <span></span>
              <i>{{ 'SEATS_SCREEN' | tr }}</i>
              <span></span>
            </div>
            <div class="map2d__rows">
              @for (row of rows(); track row.label) {
                <div class="map2d__row" [class.is-vip]="row.isVip">
                  <span class="map2d__rowlabel">{{ row.label }}</span>
                  <div class="map2d__seats">
                    @for (cell of row.seats; track cell.code) {
                      @if (cell.code === '__gap__') {
                        <span class="map2d__gap"></span>
                      } @else {
                        <button
                          type="button"
                          class="seat"
                          [class.is-vip]="cell.state === 'vip'"
                          [class.is-sel]="cell.state === 'selected'"
                          [class.is-taken]="cell.state === 'taken'"
                          [disabled]="cell.state === 'taken' || !interactive"
                          (click)="toggle.emit(cell.code)"
                          [attr.aria-label]="cell.code"
                        ></button>
                      }
                    }
                  </div>
                </div>
              }
            </div>
          </div>
        }

        @if (view() === '3d') {
          <div class="stage" #stage (pointerdown)="orbitStart($event)" (pointermove)="orbitMove($event)" (pointerup)="orbitEnd()" (pointerleave)="orbitEnd()">
            <div class="stage3d" #stage3d>
              <div class="screen3d">
                <span class="screen3d__label">{{ 'SEATS_SCREEN' | tr }}</span>
              </div>
              <div class="rows3d">
                @for (row of rows(); track row.label; let ri = $index) {
                  <div class="rows3d__row" [class.is-vip]="row.isVip" [style.--z]="ri">
                    <span class="rows3d__label">{{ row.label }}</span>
                    <div class="rows3d__seats">
                      @for (cell of row.seats; track cell.code) {
                        @if (cell.code === '__gap__') {
                          <span class="rows3d__gap"></span>
                        } @else {
                          <button
                            type="button"
                            class="seat"
                            [class.is-vip]="cell.state === 'vip'"
                            [class.is-sel]="cell.state === 'selected'"
                            [class.is-taken]="cell.state === 'taken'"
                            [disabled]="cell.state === 'taken' || !interactive"
                            (click)="toggle.emit(cell.code)"
                            [attr.aria-label]="cell.code"
                          ></button>
                        }
                      }
                    </div>
                  </div>
                }
              </div>
            </div>
          </div>
        }
      </div>
    }
  `,
  styles: `
    .seat-view { display: flex; flex-direction: column; gap: 18px; }

    .seat-view__tabs { display: inline-flex; align-self: flex-start; gap: 4px; border: 1px solid var(--line-strong); border-radius: 12px; padding: 4px; background: var(--surface); }
    .seat-view__tabs button { display: inline-flex; align-items: center; gap: 8px; border: 0; background: transparent; color: var(--text-2); font-weight: 700; font-size: 13px; padding: 8px 16px; border-radius: 9px; transition: all .25s var(--ease); }
    .seat-view__tabs button.active { background: var(--gold-dim); color: var(--gold); }
    .seat-view__tabs button:hover:not(.active) { color: var(--text); }

    .seat {
      position: relative;
      width: clamp(20px, 2.4vw, 30px); height: clamp(24px, 2.8vw, 34px);
      border-radius: 6px; border: 1px solid rgba(255,255,255,0.16);
      background: linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02));
      transition: transform .15s var(--ease), background .15s, border-color .15s, box-shadow .15s;
      padding: 0; flex-shrink: 0;
    }
    .seat:hover:not(:disabled) { transform: scale(1.12); border-color: var(--gold); }
    .seat.is-vip { background: linear-gradient(180deg, rgba(201,164,102,0.45), rgba(201,164,102,0.2)); border-color: rgba(201,164,102,0.75); }
    .seat.is-sel {
      background: linear-gradient(180deg, var(--gold-2), var(--gold)); border-color: var(--gold);
      box-shadow: 0 4px 16px -2px rgba(201,164,102,0.7);
    }
    .seat.is-taken { background: rgba(255,255,255,0.03); border-color: rgba(255,255,255,0.05); cursor: not-allowed; }
    .seat.is-taken::after { content: ''; position: absolute; inset: 30% 12%; border-top: 1.5px solid rgba(255,255,255,0.12); transform: rotate(45deg); }
    .seat.is-vip.is-taken::after { border-color: rgba(201,164,102,0.3); }

    /* ---- 2D ---- */
    .map2d { padding: 22px; border-radius: 16px; background: linear-gradient(180deg, var(--surface), var(--bg-2)); border: 1px solid var(--line); }
    .screen { position: relative; display: flex; align-items: center; justify-content: center; gap: 14px; height: 46px; margin-bottom: 26px; }
    .screen span { height: 1px; flex: 1; background: linear-gradient(90deg, transparent, rgba(201,164,102,0.45)); }
    .screen span:last-child { transform: scaleX(-1); }
    .screen i {
      font-style: normal; font-size: 10px; font-weight: 700; letter-spacing: 0.42em; text-transform: uppercase; color: var(--text-3);
      background: linear-gradient(180deg, rgba(201,164,102,0.5), transparent 80%); -webkit-background-clip: text; background-clip: text; color: transparent;
      padding-bottom: 10px;
    }
    .map2d__rows { display: flex; flex-direction: column; gap: 10px; }
    .map2d__row { display: flex; align-items: center; justify-content: center; gap: 16px; }
    .map2d__row.is-vip { background: rgba(201,164,102,0.05); margin-inline: -14px; padding-inline: 14px; border-radius: 10px; padding-block: 8px; }
    .map2d__rowlabel { font-size: 10.5px; font-weight: 800; letter-spacing: 0.1em; color: var(--text-3); width: 12px; text-align: center; flex-shrink: 0; }
    .map2d__row.is-vip .map2d__rowlabel { color: var(--gold); }
    .map2d__seats { display: flex; gap: clamp(4px, .5vw, 6px); align-items: center; }
    .map2d__gap { width: clamp(14px, 2vw, 26px); flex-shrink: 0; }

    /* ---- 3D ---- */
    .stage {
      perspective: 1050px; perspective-origin: 50% 18%;
      border-radius: 16px; border: 1px solid var(--line);
      background: radial-gradient(120% 90% at 50% 12%, #16161c 0%, var(--bg-2) 70%);
      overflow: hidden; touch-action: pan-y;
      user-select: none; cursor: grab;
    }
    .stage:active { cursor: grabbing; }
    .stage3d {
      transform-style: preserve-3d;
      transform: rotateX(56deg) rotateY(var(--ry, 0deg));
      transition: transform 0.35s var(--ease);
      padding: 64px 34px 90px;
    }
    .screen3d {
      position: relative; margin: 0 auto 44px; width: 82%; min-height: 92px;
      border-radius: 4px;
      background: linear-gradient(180deg, rgba(230,201,143,0.35), rgba(201,164,102,0.04));
      border: 1px solid rgba(201,164,102,0.5);
      box-shadow: 0 0 60px rgba(201,164,102,0.25), inset 0 0 40px rgba(201,164,102,0.12);
      display: grid; place-items: center;
    }
    .screen3d__label { font-size: 10px; letter-spacing: 0.4em; text-transform: uppercase; color: rgba(230,201,143,0.9); font-weight: 700; }
    .rows3d { display: flex; flex-direction: column; gap: 10px; transform-style: preserve-3d; }
    .rows3d__row {
      display: flex; align-items: center; justify-content: center; gap: 14px;
      transform: translateZ(calc(var(--z) * -32px));
      transform-style: preserve-3d;
      border-radius: 8px; padding-block: 5px;
    }
    .rows3d__row.is-vip { background: rgba(201,164,102,0.06); }
    .rows3d__label { font-size: 10px; font-weight: 800; color: var(--text-3); width: 10px; text-align: center; }
    .rows3d__row.is-vip .rows3d__label { color: var(--gold); }
    .rows3d__seats { display: flex; gap: clamp(4px, .5vw, 6px); }
    .rows3d__gap { width: clamp(12px, 1.6vw, 22px); }
  `,
})
export class SeatMapComponent {
  @Input({ required: true }) hall!: CinemaHall;
  @Input() booked: string[] = [];
  @Input() selected: string[] = [];
  @Input() interactive = true;
  @Output() toggle = new EventEmitter<string>();
  @Output() viewChange = new EventEmitter<ViewKind>();

  @ViewChild('stage3d') private stage3d?: ElementRef<HTMLElement>;
  private currentView: ViewKind = '2d';
  private ry = 0;
  private dragging = false;
  private lastX = 0;

  view(): ViewKind {
    return this.currentView;
  }

  rows(): RowModel[] {
    const hall = this.hall;
    const vipStart = Math.max(0, hall.rows - hall.vipRows);
    const rows: RowModel[] = [];
    for (let r = 0; r < hall.rows; r++) {
      const label = String.fromCharCode(65 + r);
      const seats: SeatCell[] = [];
      for (let c = 1; c <= hall.seatsPerRow; c++) {
        if (isAisle(hall, c)) seats.push({ code: '__gap__', col: c, state: 'available' });
        const code = `${label}${c}`;
        const state: SeatState = this.selected.includes(code)
          ? 'selected'
          : this.booked.includes(code)
            ? 'taken'
            : r >= vipStart
              ? 'vip'
              : 'available';
        seats.push({ code, col: c, state });
      }
      rows.push({ label, isVip: r >= vipStart, seats });
    }
    return rows;
  }

  setView(v: ViewKind): void {
    this.currentView = v;
    this.viewChange.emit(v);
  }

  // ---- orbit ----
  orbitStart(e: PointerEvent): void {
    this.dragging = true;
    this.lastX = e.clientX;
  }

  orbitMove(e: PointerEvent): void {
    if (!this.dragging) return;
    const delta = e.clientX - this.lastX;
    this.lastX = e.clientX;
    this.ry = Math.max(-20, Math.min(20, this.ry + delta * 0.18));
    this.stage3d?.nativeElement.style.setProperty('--ry', `${this.ry}deg`);
  }

  orbitEnd(): void {
    this.dragging = false;
  }
}