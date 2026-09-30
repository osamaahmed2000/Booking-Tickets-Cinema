import { Injectable, computed, signal } from '@angular/core';
import { en } from './en';
import { ar } from './ar';
import type { Lang } from '../models';

const dictionaries: Record<Lang, Record<string, string>> = { en, ar };
const STORE_KEY = 'noir:lang';

function detectInitial(): Lang {
  try {
    const saved = localStorage.getItem(STORE_KEY);
    if (saved === 'en' || saved === 'ar') return saved;
  } catch {
    /* ignore */
  }
  const nav = (navigator.language || 'en').toLowerCase();
  return nav.startsWith('ar') ? 'ar' : 'en';
}

@Injectable({ providedIn: 'root' })
export class I18nService {
  readonly lang = signal<Lang>(detectInitial());
  readonly dir = computed<Lang extends never ? never : 'ltr' | 'rtl'>(() =>
    this.lang() === 'ar' ? 'rtl' : 'ltr',
  );

  constructor() {
    this.apply();
  }

  setLang(lang: Lang): void {
    this.lang.set(lang);
    try {
      localStorage.setItem(STORE_KEY, lang);
    } catch {
      /* ignore */
    }
    this.apply();
  }

  toggle(): void {
    this.setLang(this.lang() === 'en' ? 'ar' : 'en');
  }

  t(key: string, params?: Record<string, string | number>): string {
    const dict = dictionaries[this.lang()];
    let str = dict[key] ?? dictionaries.en[key] ?? key;
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        str = str.replaceAll(`{${k}}`, String(v));
      }
    }
    return str;
  }

  word(key: string): string {
    return this.t(key);
  }

  locale(): string {
    return this.lang() === 'ar' ? 'ar-EG' : 'en-US';
  }

  private apply(): void {
    const dir = this.dir();
    document.documentElement.lang = this.lang();
    document.documentElement.dir = dir;
    document.body.dir = dir;
  }
}