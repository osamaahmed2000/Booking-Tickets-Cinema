import { ChangeDetectionStrategy, Component } from '@angular/core';
import { I18nService } from '../../core/i18n/i18n.service';
import { Lang } from '../../core/models';

@Component({
  selector: 'app-lang-switch',
  standalone: true,
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="lang" role="group" aria-label="Language">
      @for (l of langs; track l) {
        <button
          type="button"
          class="lang__btn"
          [class.active]="current === l"
          (click)="set(l)"
          [lang]="l"
        >
          {{ l === 'en' ? 'EN' : 'عربي' }}
        </button>
      }
    </div>
  `,
  styles: `
    .lang { display: inline-flex; align-items: center; border: 1px solid var(--line-strong); border-radius: 999px; padding: 3px; gap: 2px; background: rgba(255,255,255,0.02); }
    .lang__btn {
      border: 0; background: transparent; color: var(--text-2); font-weight: 800; font-size: 11.5px;
      letter-spacing: 0.06em; padding: 6px 14px; border-radius: 999px; transition: all 0.25s var(--ease);
    }
    .lang__btn:hover { color: var(--text); }
    .lang__btn.active { background: var(--gold); color: var(--gold-ink); }
  `,
})
export class LangSwitchComponent {
  readonly langs: Lang[] = ['en', 'ar'];

  constructor(private i18n: I18nService) {}

  get current(): Lang {
    return this.i18n.lang();
  }

  set(lang: Lang): void {
    this.i18n.setLang(lang);
  }
}