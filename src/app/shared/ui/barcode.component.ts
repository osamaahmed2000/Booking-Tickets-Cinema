import { Component, Input } from '@angular/core';
import { hashString } from '../../core/utils';

@Component({
  selector: 'app-barcode',
  standalone: true,
  templateUrl: './barcode.component.html',
  styleUrl: './barcode.component.scss',
})
export class BarcodeComponent {
  @Input({ required: true }) value = '';

  bars(): { x: number; w: number }[] {
    const seed = hashString(this.value);
    const bars: { x: number; w: number }[] = [];
    let x = 0;
    let n = seed;
    const widths = [1.6, 0.8, 2.4, 1.2, 3.2, 1, 2, 0.7, 2.8, 1.4];
    while (x < 258) {
      const w = widths[n % widths.length];
      bars.push({ x, w: Math.min(w, 258 - x) });
      x += w + (n % 2 === 0 ? 1.4 : 0.9);
      n = (Math.imul(n, 31) + 7) >>> 0;
    }
    return bars;
  }
}