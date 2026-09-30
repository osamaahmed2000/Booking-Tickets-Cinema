import { ChangeDetectionStrategy, Component } from '@angular/core';
import { I18nService } from '../../core/i18n/i18n.service';
import { Lang } from '../../core/models';

@Component({
  selector: 'app-lang-switch',
  standalone: true,
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './lang-switch.component.html',
  styleUrl: './lang-switch.component.scss',
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