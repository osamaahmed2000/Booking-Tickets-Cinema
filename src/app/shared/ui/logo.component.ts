import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { I18nService } from '../../core/i18n/i18n.service';

@Component({
  selector: 'app-logo',
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <a class="logo" routerLink="/" aria-label="NOIR">
      <svg class="logo__mark" viewBox="0 0 40 40" fill="none" aria-hidden="true">
        <circle cx="20" cy="20" r="16" stroke="currentColor" stroke-width="1.4" />
        <circle cx="20" cy="20" r="10.5" stroke="currentColor" stroke-width="1.2" opacity="0.55" />
        <circle cx="20" cy="20" r="4.4" fill="currentColor" />
        <path d="M20 1.5v6M20 32.5v6M1.5 20h6M32.5 20h6" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" />
        <path d="M7 7l4.2 4.2M28.8 28.8L33 33M33 7l-4.2 4.2M11.2 28.8L7 33" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" opacity="0.6" />
        <path d="M20 13.8a6.2 6.2 0 1 0 0 12.4 6.2 6.2 0 0 0 0-12.4z" stroke="currentColor" stroke-width="1" opacity="0.9" />
      </svg>
      <span class="logo__name">
        <span>{{ brand }}</span>
        @if (tag()) { <small>{{ tagLine }}</small> }
      </span>
    </a>
  `,
  styles: `
    .logo { display: inline-flex; align-items: center; gap: 12px; color: var(--text); }
    .logo__mark { width: 40px; height: 40px; color: var(--gold); flex-shrink: 0; transition: transform 0.6s var(--ease); }
    .logo:hover .logo__mark { transform: rotate(90deg); }
    .logo__name { display: flex; flex-direction: column; line-height: 1.05; }
    .logo__name > span { font-family: var(--font-display); font-size: 22px; font-weight: 700; letter-spacing: 0.34em; }
    html[lang='ar'] .logo__name > span { font-family: 'Tajawal', sans-serif; font-size: 20px; letter-spacing: 0.06em; }
    .logo__name small { font-size: 9px; font-weight: 700; letter-spacing: 0.4em; text-transform: uppercase; color: var(--text-3); margin-top: 3px; }
  `,
})
export class LogoComponent {
  readonly tag = input(false);
  readonly brand: string;
  readonly tagLine: string;

  constructor(private i18n: I18nService) {
    this.brand = this.i18n.t('BRAND');
    this.tagLine = this.i18n.t('BRAND_TAG');
  }
}