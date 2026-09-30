import { Pipe, PipeTransform } from '@angular/core';
import { I18nService } from '../../core/i18n/i18n.service';
import type { Localized } from '../../core/models';

@Pipe({ name: 'local', pure: false })
export class LocalizePipe implements PipeTransform {
  constructor(private i18n: I18nService) {}

  transform(value: Localized | undefined | null): string {
    if (!value) return '';
    const lang = this.i18n.lang();
    return value[lang] ?? value.en ?? '';
  }
}