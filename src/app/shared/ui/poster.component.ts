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

  readonly isArabic = computed(() => {
    return /[\u0600-\u06FF]/.test(this.title());
  });
}