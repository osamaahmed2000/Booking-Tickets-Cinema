import { Pipe, PipeTransform } from '@angular/core';
import { I18nService } from '../../core/i18n/i18n.service';
import { DataService } from '../../core/services/data.service';

@Pipe({ name: 'money', pure: false })
export class MoneyPipe implements PipeTransform {
  constructor(private i18n: I18nService, private data: DataService) {}

  transform(value: number): string {
    const currency = this.data.settings().currency;
    try {
      return new Intl.NumberFormat(this.i18n.locale(), {
        style: 'currency',
        currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(value);
    } catch {
      return `${value} ${currency}`;
    }
  }
}