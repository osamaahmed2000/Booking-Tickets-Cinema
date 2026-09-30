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
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
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