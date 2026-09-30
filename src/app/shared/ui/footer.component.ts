import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DataService } from '../../core/services/data.service';
import { I18nService } from '../../core/i18n/i18n.service';
import { LogoComponent } from './logo.component';
import { LangSwitchComponent } from './lang-switch.component';
import { TranslatePipe } from '../pipes/translate.pipe';
import { LocalizePipe } from '../pipes/localize.pipe';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink, LogoComponent, LangSwitchComponent, TranslatePipe, LocalizePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <footer class="foot">
      <div class="container">
        <div class="foot__top">
          <div class="foot__brand">
            <app-logo [tag]="true" />
            <p class="foot__about">{{ 'FO_ABOUT' | tr }}</p>
            <div class="foot__lang">
              <span>{{ 'FO_LANGS' | tr }}</span>
              <app-lang-switch />
            </div>
          </div>

          <div class="foot__col">
            <h4>{{ 'FO_OPEN' | tr }}</h4>
            <a routerLink="/movies">{{ 'FO_OPEN_NOW' | tr }}</a>
            <a [routerLink]="['/movies']" [queryParams]="{ status: 'soon' }">{{ 'FO_OPEN_SOON' | tr }}</a>
            <a routerLink="/">{{ 'FO_OPEN_HALLS' | tr }}</a>
          </div>

          <div class="foot__col">
            <h4>{{ 'FO_SUPPORT' | tr }}</h4>
            <a routerLink="/bookings">{{ 'FO_SUPPORT_B' | tr }}</a>
            <a href="javascript:void(0)">{{ 'FO_SUPPORT_F' | tr }}</a>
            <a href="javascript:void(0)">{{ 'FO_SUPPORT_T' | tr }}</a>
          </div>

          <div class="foot__col foot__contact">
            <h4>{{ settings.cinemaName | local }}</h4>
            <a href="mailto:{{ settings.email }}">{{ settings.email }}</a>
            <a href="tel:{{ settings.phone }}">{{ settings.phone }}</a>
            <span>{{ settings.address | local }}</span>
            <div class="foot__social">
              <a href="javascript:void(0)" aria-label="Instagram">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none"/></svg>
              </a>
              <a href="javascript:void(0)" aria-label="X">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M18.9 2H22l-7.6 8.7L23 22h-6.8l-5.3-6.4L4.8 22H1.6l8.2-9.3L1 2h7l4.8 5.8L18.9 2zm-1.2 18h1.8L6.5 3.8H4.6L17.7 20z"/></svg>
              </a>
              <a href="javascript:void(0)" aria-label="YouTube">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="2.5" y="5" width="19" height="14" rx="4"/><path d="M10.5 9.5l5 2.5-5 2.5v-5z" fill="currentColor" stroke="none"/></svg>
              </a>
            </div>
          </div>
        </div>

        <div class="foot__bottom">
          <span>© {{ year }} {{ settings.cinemaName | local }}. {{ 'FO_RIGHTS' | tr }}</span>
          <span class="foot__made">{{ 'FO_MADE' | tr }}</span>
        </div>
      </div>
    </footer>
  `,
  styles: `
    .foot { border-top: 1px solid var(--line); background: linear-gradient(180deg, var(--bg), #050507); padding-top: 64px; }
    .foot__top { display: grid; grid-template-columns: 1.6fr 1fr 1fr 1.2fr; gap: 40px; padding-bottom: 52px; }
    .foot__about { color: var(--text-3); font-size: 14px; max-width: 34ch; margin-top: 20px; line-height: 1.7; }
    .foot__lang { display: flex; align-items: center; gap: 12px; margin-top: 22px; font-size: 12px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; color: var(--text-3); }
    .foot__col { display: flex; flex-direction: column; gap: 11px; }
    .foot__col h4 { font-family: var(--font-body); font-size: 12px; letter-spacing: .22em; text-transform: uppercase; color: var(--gold); margin-bottom: 8px; font-weight: 700; }
    .foot__col a, .foot__col span { color: var(--text-2); font-size: 14px; transition: color .2s; }
    .foot__col a:hover { color: var(--text); }
    .foot__contact span { color: var(--text-3); font-size: 13.5px; }
    .foot__social { display: flex; gap: 10px; margin-top: 8px; }
    .foot__social a { width: 38px; height: 38px; display: grid; place-items: center; border: 1px solid var(--line); border-radius: 10px; color: var(--text-2); transition: all .25s var(--ease); }
    .foot__social a:hover { border-color: var(--gold); color: var(--gold); transform: translateY(-2px); }
    .foot__bottom { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding-block: 24px; border-top: 1px solid var(--line); color: var(--text-3); font-size: 13px; }
    @media (max-width: 860px) { .foot__top { grid-template-columns: 1fr 1fr; } }
    @media (max-width: 520px) {
      .foot__top { grid-template-columns: 1fr; }
      .foot__bottom { flex-direction: column; text-align: center; }
    }
  `,
})
export class FooterComponent {
  readonly year = new Date().getFullYear();
  readonly settings: ReturnType<DataService['settings']>;

  constructor(private data: DataService) {
    this.settings = this.data.settings();
  }
}