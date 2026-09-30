import { Pipe, PipeTransform } from '@angular/core';
import { I18nService } from '../../core/i18n/i18n.service';

@Pipe({ name: 'day', pure: false })
export class DayPipe implements PipeTransform {
  constructor(private i18n: I18nService) {}

  transform(dateISO: string): string {
    const d = new Date(`${dateISO}T12:00:00`);
    return new Intl.DateTimeFormat(this.i18n.locale(), {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    }).format(d);
  }
}

@Pipe({ name: 'dayShort', pure: false })
export class DayShortPipe implements PipeTransform {
  constructor(private i18n: I18nService) {}

  transform(dateISO: string): string {
    const d = new Date(`${dateISO}T12:00:00`);
    return new Intl.DateTimeFormat(this.i18n.locale(), {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    }).format(d);
  }
}

@Pipe({ name: 'clock', pure: false })
export class ClockPipe implements PipeTransform {
  constructor(private i18n: I18nService) {}

  transform(time: string): string {
    const [h, m] = time.split(':').map(Number);
    const d = new Date();
    d.setHours(h, m, 0, 0);
    return new Intl.DateTimeFormat(this.i18n.locale(), {
      hour: 'numeric',
      minute: '2-digit',
    }).format(d);
  }
}

@Pipe({ name: 'relativeDay', pure: false })
export class RelativeDayPipe implements PipeTransform {
  constructor(private i18n: I18nService) {}

  transform(dateISO: string): string {
    const today = new Date();
    const d = new Date(`${dateISO}T12:00:00`);
    const diff = Math.round((d.getTime() - today.getTime()) / 86400000);
    if (diff === 0) return this.i18n.t('REL_TODAY', {});
    if (diff === 1) return this.i18n.t('REL_TOMORROW', {});
    if (diff === 2) return this.i18n.t('REL_DAYAFTER', {});
    return this.i18n.t('REL_DEFAULT', {});
  }
}