import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  signal,
} from '@angular/core';
import type { CinemaHall } from '../../core/models';
import { isAisle } from '../../core/utils';
import { TranslatePipe } from '../pipes/translate.pipe';
import { Cinema3dSeatMapComponent } from './cinema-3d-seat-map/cinema-3d-seat-map.component';

export type ViewKind = '2d' | '3d';
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
  imports: [TranslatePipe, Cinema3dSeatMapComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './seat-map.component.html',
  styleUrl: './seat-map.component.scss',
})
export class SeatMapComponent {
  @Input({ required: true }) hall!: CinemaHall;
  @Input() booked: string[] = [];
  @Input() selected: string[] = [];
  @Input() standardPrice = 120;
  @Input() vipPrice = 180;
  @Input() currency = 'EGP';
  @Input() movieTitle = 'Cinema Presentation';
  @Input() interactive = true;

  @Output() toggle = new EventEmitter<string>();
  @Output() viewChange = new EventEmitter<ViewKind>();

  readonly view = signal<ViewKind>('3d');

  rows(): RowModel[] {
    const hall = this.hall;
    if (!hall) return [];
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
    this.view.set(v);
    this.viewChange.emit(v);
  }
}