import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import type { Movie } from '../../core/models';
import { PosterComponent } from './poster.component';
import { LocalizePipe } from '../pipes/localize.pipe';
import { TranslatePipe } from '../pipes/translate.pipe';

@Component({
  selector: 'app-movie-card',
  standalone: true,
  imports: [RouterLink, PosterComponent, LocalizePipe, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <a class="mcard" [routerLink]="['/movie', movie().id]">
      <div class="mcard__poster">
        <app-poster [art]="movie().art" [title]="movie().title | local" [year]="movie().year" />
        @if (movie().badge) {
          <span class="mcard__badge tag tag--gold">{{ movie().badge }}</span>
        }
        @if (movie().status === 'soon') {
          <div class="mcard__soon">
            <span class="mcard__soon-title">{{ 'MOVIES_SOON' | tr }}</span>
            <span class="mcard__soon-date">{{ movie().year }}</span>
          </div>
        } @else {
          <div class="mcard__overlay">
            <span class="mcard__score">
              <b>{{ movie().rating.toFixed(1) }}</b>
              <i>/ 10</i>
            </span>
            <span class="mcard__cta">
              {{ 'MOVIES_TICKETS' | tr }}
              <svg class="icon-fwd" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 6l6 6-6 6" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </span>
          </div>
        }
      </div>
      <div class="mcard__body">
        <h3 class="mcard__title">{{ movie().title | local }}</h3>
        <div class="mcard__meta">
          <span>{{ movie().year }}</span>
          <span class="dot">·</span>
          <span>{{ movie().durationMin }} {{ 'C_MIN' | tr }}</span>
          <span class="dot">·</span>
          <span>{{ movie().age }}</span>
        </div>
        <div class="mcard__genres">
          @for (g of movie().genres.slice(0, 3); track g.en) {
            <span>{{ g | local }}</span>
          }
        </div>
      </div>
    </a>
  `,
  styles: `
    .mcard { cursor: pointer; display: block; position: relative; }
    .mcard__poster { position: relative; border-radius: 14px; overflow: hidden; aspect-ratio: 2 / 3; }
    .mcard__badge { position: absolute; inset-inline-start: 12px; top: 12px; z-index: 2; backdrop-filter: blur(8px); background: rgba(12,11,9,.6); }
    .mcard__overlay {
      position: absolute; inset: 0; display: flex; flex-direction: column; justify-content: space-between;
      padding: 16px; background: linear-gradient(180deg, transparent 40%, rgba(4,4,6,.86));
      opacity: 0; transition: opacity .4s var(--ease);
    }
    .mcard:hover .mcard__overlay { opacity: 1; }
    .mcard__score { display: inline-flex; align-items: baseline; gap: 4px; color: var(--gold-2); }
    .mcard__score b { font-family: var(--font-display); font-size: 30px; font-weight: 700; }
    .mcard__score i { font-style: normal; font-size: 12px; opacity: .7; }
    .mcard__cta { align-self: flex-end; display: inline-flex; align-items: center; gap: 8px; font-weight: 700; font-size: 13px; color: var(--text); }
    .mcard__soon { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; background: rgba(6,6,8,.55); backdrop-filter: blur(3px); }
    .mcard__soon-title { font-size: 11px; letter-spacing: .34em; text-transform: uppercase; color: var(--gold); font-weight: 700; }
    .mcard__soon-date { font-size: 12px; color: var(--text-2); }
    .mcard__body { padding-top: 14px; }
    .mcard__title { font-size: 19px; font-weight: 600; letter-spacing: -0.01em; margin-bottom: 7px; transition: color .25s; }
    .mcard__meta { display: flex; align-items: center; gap: 8px; color: var(--text-3); font-size: 12.5px; margin-bottom: 9px; }
    .mcard__meta .dot { opacity: .5; }
    .mcard__genres { display: flex; flex-wrap: wrap; gap: 6px; }
    .mcard__genres span { font-size: 11px; color: var(--text-2); background: var(--surface); border: 1px solid var(--line); padding: 3px 9px; border-radius: 999px; }
    .mcard:hover .mcard__title { color: var(--gold-2); }
  `,
})
export class MovieCardComponent {
  readonly movie = input.required<Movie>();
}