import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { I18nService } from '../../../core/i18n/i18n.service';
import { LogoComponent } from '../../../shared/ui/logo.component';
import { LangSwitchComponent } from '../../../shared/ui/lang-switch.component';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';

@Component({
  selector: 'page-admin-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, LogoComponent, LangSwitchComponent, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="adm">
      <aside class="adm__side">
        <div class="adm__brand">
          <app-logo />
        </div>
        <nav class="adm__nav">
          @for (item of nav; track item.href) {
            <a
              class="adm__link"
              [routerLink]="item.href"
              routerLinkActive="active"
              [class.active]="item.href === '/admin/dashboard' && router.url === '/admin'"
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true" [innerHTML]="item.icon"></svg>
              {{ item.label }}
            </a>
          }
        </nav>
        <div class="adm__foot">
          <app-lang-switch />
          <a class="adm__ext" routerLink="/">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3v13M6 10l6-6 6 6M4 21h16" stroke-linecap="round" stroke-linejoin="round"/></svg>
            {{ 'AD_BACK_SITE' | tr }}
          </a>
          <button type="button" class="adm__logout" (click)="logout()">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" stroke-linecap="round" stroke-linejoin="round"/></svg>
            {{ 'AD_LOGOUT' | tr }}
          </button>
        </div>
      </aside>

      <div class="adm__main">
        <router-outlet />
      </div>
    </div>
  `,
  styles: `
    .adm { display: grid; grid-template-columns: 250px 1fr; min-height: 100vh; }
    .adm__side { border-inline-end: 1px solid var(--line); background: var(--bg-2); display: flex; flex-direction: column; position: sticky; top: 0; height: 100vh; padding: 22px 14px 18px; }
    .adm__brand { padding: 6px 10px 22px; border-bottom: 1px solid var(--line); margin-bottom: 16px; }
    .adm__nav { display: flex; flex-direction: column; gap: 4px; flex: 1; }
    .adm__link { display: flex; align-items: center; gap: 12px; padding: 11px 14px; border-radius: 10px; color: var(--text-2); font-size: 14px; font-weight: 600; transition: all .2s; }
    .adm__link:hover { background: var(--surface); color: var(--text); }
    .adm__link.active { background: var(--gold-dim); color: var(--gold); }
    .adm__link svg { flex-shrink: 0; }
    .adm__foot { display: flex; flex-direction: column; gap: 10px; border-top: 1px solid var(--line); padding-top: 14px; }
    .adm__foot app-lang-switch { margin-inline-start: 12px; }
    .adm__ext, .adm__logout { display: flex; align-items: center; gap: 10px; padding: 9px 12px; border-radius: 9px; color: var(--text-3); font-size: 13px; background: none; border: 0; text-align: start; transition: color .2s; }
    .adm__ext:hover { color: var(--text); }
    .adm__logout:hover { color: var(--red); }
    .adm__main { padding: 34px 34px 60px; min-width: 0; }
    @media (max-width: 860px) {
      .adm { grid-template-columns: 1fr; }
      .adm__side { position: static; height: auto; flex-direction: row; align-items: center; gap: 12px; padding: 12px 16px; overflow-x: auto; }
      .adm__brand { border: 0; padding: 0; margin: 0; }
      .adm__brand :host ::ng-deep .logo__name small { display: none; }
      .adm__nav { flex-direction: row; }
      .adm__link { padding: 9px 12px; white-space: nowrap; }
      .adm__link svg { display: none; }
      .adm__foot { flex-direction: row; border-top: 0; padding-top: 0; margin-inline-start: auto; }
      .adm__ext, .adm__logout { padding: 8px; }
      .adm__main { padding: 22px 16px 60px; }
    }
  `,
  host: { class: 'page-admin' },
})
export class AdminLayoutComponent {
  constructor(
    private auth: AuthService,
    private i18n: I18nService,
    readonly router: Router,
  ) {}

  get nav() {
    return [
      { href: '/admin/dashboard', label: this.i18n.t('AD_NAV_DASH'), icon: '<rect x="3" y="3" width="7.5" height="9" rx="1.5"/><rect x="13.5" y="3" width="7.5" height="5" rx="1.5"/><rect x="13.5" y="12" width="7.5" height="9" rx="1.5"/><rect x="3" y="16" width="7.5" height="5" rx="1.5"/>' },
      { href: '/admin/movies', label: this.i18n.t('AD_NAV_MOVIES'), icon: '<rect x="2.5" y="2.5" width="19" height="19" rx="3"/><circle cx="12" cy="12" r="3.5"/><path d="M8.5 8.5l-1-3M15.5 8.5l1-3M8.5 15.5l-1 3M15.5 15.5l1 3"/>' },
      { href: '/admin/halls', label: this.i18n.t('AD_NAV_HALLS'), icon: '<path d="M3 21V9l9-6 9 6v12"/><path d="M9 21v-6h6v6"/>' },
      { href: '/admin/showtimes', label: this.i18n.t('AD_NAV_SHOWTIMES'), icon: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>' },
      { href: '/admin/bookings', label: this.i18n.t('AD_NAV_BOOKINGS'), icon: '<rect x="3" y="4" width="18" height="16" rx="3"/><path d="M8 8h8M8 12h5"/>' },
    ];
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/admin/login']);
  }
}