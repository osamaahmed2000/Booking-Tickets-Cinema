import { Pipe, PipeTransform } from '@angular/core';
import { I18nService } from '../../core/i18n/i18n.service';

function parseDateSafely(val: string | number | Date | null | undefined): Date | null {
  if (!val) return null;
  if (val instanceof Date) return isNaN(val.getTime()) ? null : val;
  const str = String(val).trim();
  if (!str) return null;

  if (str.includes('T') || str.includes(' ')) {
    const d = new Date(str);
    if (!isNaN(d.getTime())) return d;
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    const d = new Date(`${str}T12:00:00`);
    if (!isNaN(d.getTime())) return d;
  }

  const fallback = new Date(str);
  return isNaN(fallback.getTime()) ? null : fallback;
}

@Pipe({ name: 'day', pure: false })
export class DayPipe implements PipeTransform {
  constructor(private i18n: I18nService) {}

  transform(dateISO: string | null | undefined): string {
    const d = parseDateSafely(dateISO);
    if (!d) return '';
    try {
      return new Intl.DateTimeFormat(this.i18n.locale(), {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      }).format(d);
    } catch {
      return '';
    }
  }
}

@Pipe({ name: 'dayShort', pure: false })
export class DayShortPipe implements PipeTransform {
  constructor(private i18n: I18nService) {}

  transform(dateISO: string | null | undefined): string {
    const d = parseDateSafely(dateISO);
    if (!d) return '';
    try {
      return new Intl.DateTimeFormat(this.i18n.locale(), {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
      }).format(d);
    } catch {
      return '';
    }
  }
}

@Pipe({ name: 'clock', pure: false })
export class ClockPipe implements PipeTransform {
  constructor(private i18n: I18nService) {}

  transform(time: string | null | undefined): string {
    if (!time) return '';
    const str = String(time).trim();
    const parts = str.split(':');
    if (parts.length < 2) return str;
    const h = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10);
    if (isNaN(h) || isNaN(m)) return str;

    const d = new Date();
    d.setHours(h, m, 0, 0);
    try {
      return new Intl.DateTimeFormat(this.i18n.locale(), {
        hour: 'numeric',
        minute: '2-digit',
      }).format(d);
    } catch {
      return str;
    }
  }
}

@Pipe({ name: 'relativeDay', pure: false })
export class RelativeDayPipe implements PipeTransform {
  constructor(private i18n: I18nService) {}

  transform(dateISO: string | null | undefined): string {
    const d = parseDateSafely(dateISO);
    if (!d) return '';
    const today = new Date();
    const diff = Math.round(
      (new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime() -
        new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime()) /
        86400000,
    );
    if (diff === 0) return this.i18n.t('REL_TODAY', {});
    if (diff === 1) return this.i18n.t('REL_TOMORROW', {});
    if (diff === 2) return this.i18n.t('REL_DAYAFTER', {});
    return this.i18n.t('REL_DEFAULT', {});
  }
}