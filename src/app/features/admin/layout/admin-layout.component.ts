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
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.scss',
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