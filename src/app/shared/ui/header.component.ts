import { ChangeDetectionStrategy, Component, HostListener } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { I18nService } from '../../core/i18n/i18n.service';
import { LogoComponent } from './logo.component';
import { LangSwitchComponent } from './lang-switch.component';
import { TranslatePipe } from '../pipes/translate.pipe';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, LogoComponent, LangSwitchComponent, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="head" [class.is-scrolled]="scrolled">
      <div class="container head__in">
        <app-logo />

        <nav class="head__nav" aria-label="Main">
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">{{ 'NAV_HOME' | tr }}</a>
          <a routerLink="/movies" routerLinkActive="active">{{ 'NAV_MOVIES' | tr }}</a>
          <a routerLink="/bookings" routerLinkActive="active">{{ 'NAV_BOOKINGS' | tr }}</a>
          <a routerLink="/admin" routerLinkActive="active" class="head__admin">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <circle cx="12" cy="8" r="3.4" />
              <path d="M5 19.5a7 7 0 0 1 14 0" />
            </svg>
            {{ 'NAV_ADMIN' | tr }}
          </a>
        </nav>

        <div class="head__tools">
          <app-lang-switch />
          <a class="btn btn--gold btn--sm" routerLink="/movies">Ticket</a>
          <button type="button" class="head__burger" (click)="menu = !menu" aria-label="Menu">
            <span></span><span></span><span></span>
          </button>
        </div>
      </div>

      @if (menu) {
        <div class="menu">
          <div class="menu__inner">
            @for (item of navItems; track item.label) {
              <a class="menu__link" [routerLink]="item.href" (click)="menu = false">{{ item.label }}</a>
            }
          </div>
          <div class="menu__foot">
            <app-lang-switch />
          </div>
        </div>
      }
    </header>
  `,
  styles: `
    .head {
      position: sticky; top: 0; z-index: 1200;
      border-bottom: 1px solid transparent;
      transition: background 0.35s, border-color 0.35s, backdrop-filter 0.35s;
    }
    .head.is-scrolled { background: rgba(8, 8, 10, 0.82); backdrop-filter: blur(16px); border-color: var(--line); box-shadow: 0 10px 40px -20px rgba(0,0,0,.8); }
    .head__in { display: flex; align-items: center; justify-content: space-between; gap: 24px; height: var(--header-h); }
    .head__nav { display: flex; align-items: center; gap: 6px; }
    .head__nav a {
      position: relative; font-size: 14px; font-weight: 600; color: var(--text-2);
      padding: 9px 14px; border-radius: 999px; transition: color 0.25s;
    }
    .head__nav a:hover { color: var(--text); }
    .head__nav a.active { color: var(--gold); }
    .head__nav a.active::after { content: ''; position: absolute; inset-inline: 14px; bottom: 3px; height: 2px; border-radius: 2px; background: var(--gold); }
    .head__admin { display: inline-flex; align-items: center; gap: 6px; }
    .head__tools { display: flex; align-items: center; gap: 14px; }
    .head__tools .btn { display: none; }
    .head__burger { display: none; flex-direction: column; gap: 5px; background: transparent; border: 1px solid var(--line-strong); border-radius: 10px; padding: 10px 11px; }
    .head__burger span { width: 18px; height: 1.6px; background: var(--text); border-radius: 2px; }
    .menu { display: none; }

    @media (max-width: 920px) {
      .head__nav { display: none; }
      .head__tools .btn { display: none; }
      .head__burger { display: flex; }
      .menu { display: block; background: var(--bg-2); border-top: 1px solid var(--line); padding: 18px 24px 28px; animation: fadeIn .3s ease; }
      .menu__inner { display: flex; flex-direction: column; gap: 4px; }
      .menu__link { font-family: var(--font-display); font-size: 26px; padding: 10px 4px; color: var(--text); border-bottom: 1px solid var(--line); }
      .menu__link:hover { color: var(--gold); }
      .menu__foot { margin-top: 22px; }
    }
  `,
})
export class HeaderComponent {
  menu = false;
  scrolled = false;

  constructor(private i18n: I18nService) {}

  get navItems() {
    return [
      { label: this.i18n.t('NAV_HOME'), href: '/' },
      { label: this.i18n.t('NAV_MOVIES'), href: '/movies' },
      { label: this.i18n.t('NAV_BOOKINGS'), href: '/bookings' },
      { label: this.i18n.t('NAV_ADMIN'), href: '/admin' },
    ];
  }

  @HostListener('window:scroll', [])
  onScroll(): void {
    this.scrolled = window.scrollY > 12;
  }
}