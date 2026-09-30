import { Injectable, signal } from '@angular/core';

const KEY = 'noir:data';
const pending: Record<string, unknown> = {};

@Injectable({ providedIn: 'root' })
export class StorageService {
  get<T>(key: string): T | null {
    try {
      const raw = key === KEY ? localStorage.getItem(key) : pending[key] ?? localStorage.getItem(key);
      return raw == null ? null : (JSON.parse(raw as string) as T);
    } catch {
      return null;
    }
  }

  set<T>(key: string, value: T): void {
    try {
      const raw = JSON.stringify(value);
      if (key === KEY) localStorage.setItem(key, raw);
      else {
        pending[key] = value;
        try {
          localStorage.setItem(key, raw);
        } catch {
          /* quota — keep in-memory only */
        }
      }
    } catch {
      /* ignore */
    }
  }

  remove(key: string): void {
    delete pending[key];
    try {
      localStorage.removeItem(key);
    } catch {
      /* ignore */
    }
  }
}

export const storageVersion = signal('1.0');