import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import type { ArtConfig } from '../../core/models';

interface Line {
  text: string;
  x: number;
  y: number;
  size: number;
}

@Component({
  selector: 'app-poster',
  standalone: true,
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './poster.component.html',
  styleUrl: './poster.component.scss',
  host: { class: 'poster-host' },
})
export class PosterComponent {
  readonly art = input<ArtConfig | null>(null);
  readonly title = input('');
  readonly year = input<string | number>('');
  protected readonly uid = Math.random().toString(36).slice(2, 8);
  protected readonly pgRef = `url(#pg-${this.uid})`;
  protected readonly pg2Ref = `url(#pg2-${this.uid})`;
  protected readonly pg3Ref = `url(#pg3-${this.uid})`;
  protected readonly gridLines = [0, -60, -120, -180, -240, -300, -360].map((d) => 200 + d);
  protected readonly waves = [52, 78, 104, 130, 156, 182].map((r, i) => ({
    r,
    dy: i * 6,
    c: i % 2 === 0 ? '#9bcd6f' : '#6d5a8f',
  }));

  readonly lines = computed(() => {
    const t = this.title().trim();
    if (!t) return [];
    const words = t.split(/\s+/);
    const out: string[] = [];
    let current = '';
    const budget = 14;
    for (const w of words) {
      if ((current + ' ' + w).trim().length <= budget) {
        current = (current + ' ' + w).trim();
      } else {
        if (current) out.push(current);
        current = w.length > budget ? w.slice(0, budget - 1) + '·' : w;
      }
    }
    if (current) out.push(current);
    const shown = out.slice(0, 3);
    const size = Math.max(...shown.map((l) => l.length)) > 13 ? 24 : 30;
    const startY = 600 - 64;
    return shown.map((text, i) => ({
      text,
      x: 32,
      y: startY - (shown.length - 1 - i) * (size + 8),
      size,
    })) as Line[];
  });
}