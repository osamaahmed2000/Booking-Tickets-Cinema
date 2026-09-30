import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="nf">
      <svg width="64" height="64" viewBox="0 0 40 40" fill="none" class="nf__mark" aria-hidden="true">
        <circle cx="20" cy="20" r="16" stroke="currentColor" stroke-width="1.2" />
        <circle cx="20" cy="20" r="4.4" fill="currentColor" />
        <path d="M20 1.5v6M20 32.5v6M1.5 20h6M32.5 20h6" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" />
      </svg>
      <span class="kicker">404</span>
      <h1 class="nf__title">{{ 'NF_TITLE' | tr }}</h1>
      <p class="nf__sub">{{ 'NF_SUB' | tr }}</p>
      <div class="nf__actions">
        <a class="btn btn--gold" routerLink="/">{{ 'NF_HOME' | tr }}</a>
        <a class="btn btn--line" routerLink="/movies">{{ 'NF_BROWSE' | tr }}</a>
      </div>
    </section>
  `,
  styles: `
    .nf { min-height: 70vh; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 40px 20px; }
    .nf__mark { color: var(--gold); opacity: .85; margin-bottom: 22px; }
    .nf__title { font-size: clamp(34px, 6vw, 58px); }
    .nf__sub { color: var(--text-2); max-width: 42ch; margin-block: 16px 30px; font-size: 16px; }
    .nf__actions { display: flex; gap: 12px; flex-wrap: wrap; justify-content: center; }
  `,
})
export class NotFoundComponent {}