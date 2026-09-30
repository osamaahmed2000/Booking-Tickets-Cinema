import { Component, Input } from '@angular/core';
import { hashString } from '../../core/utils';

@Component({
  selector: 'app-qr',
  standalone: true,
  templateUrl: './qr.component.html',
  styleUrl: './qr.component.scss',
})
export class QrComponent {
  @Input({ required: true }) value = '';

  cells(): { key: string; x: number; y: number; on: boolean }[] {
    const seed = hashString(this.value);
    const n = 19;
    const size = 120 / n;
    const finder = (x0: number, y0: number): Set<string> => {
      const cells = new Set<string>();
      for (let r = 0; r < 7; r++) {
        for (let c = 0; c < 7; c++) {
          if (r === 0 || r === 6 || c === 0 || c === 6 || (r >= 2 && r <= 4 && c >= 2 && c <= 4)) {
            cells.add(`${x0 + c},${y0 + r}`);
          }
        }
      }
      return cells;
    };
    const reserved = new Set<string>([
      ...finder(0, 0),
      ...finder(n - 7, 0),
      ...finder(0, n - 7),
    ]);
    const out: { key: string; x: number; y: number; on: boolean }[] = [];
    let state = seed;
    for (let y = 0; y < n; y++) {
      for (let x = 0; x < n; x++) {
        const key = `${x},${y}`;
        let on: boolean;
        if (reserved.has(key)) {
          on = true;
        } else {
          state = (Math.imul(state, 1103515245) + 12345) >>> 0;
          on = (state >>> 13) % 100 > 52;
        }
        out.push({ key, x: x * size, y: y * size, on });
      }
    }
    return out;
  }
}