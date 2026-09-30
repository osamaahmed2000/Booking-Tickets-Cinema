import { Component, Input } from '@angular/core';
import { hashString } from '../../core/utils';

@Component({
  selector: 'app-barcode',
  standalone: true,
  template: `
    <div class="bc">
      <svg [attr.viewBox]="'0 0 260 64'" preserveAspectRatio="none" class="bc__bars" aria-hidden="true">
        @for (bar of bars(); track bar.x) {
          <rect [attr.x]="bar.x" y="2" [attr.width]="bar.w" height="52" fill="#0c0c10" rx="0.5" />
        }
      </svg>
      <span class="bc__text">{{ value }}</span>
    </div>
  `,
  styles: `
    .bc { display: flex; flex-direction: column; gap: 6px; }
    .bc__bars { width: 100%; max-width: 240px; height: 54px; }
    .bc__text { font-size: 9.5px; font-weight: 700; letter-spacing: 0.22em; color: #0c0c10; text-align: center; }
  `,
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