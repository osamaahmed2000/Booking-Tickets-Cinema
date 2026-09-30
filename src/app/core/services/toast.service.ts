import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: number;
  kind: 'ok' | 'err' | 'info';
  message: string;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly list = signal<Toast[]>([]);
  private seq = 0;
  private timers = new Map<number, ReturnType<typeof setTimeout>>();

  readonly toasts = this.list.asReadonly();

  show(message: string, kind: Toast['kind'] = 'ok', duration = 3600): void {
    const id = ++this.seq;
    this.list.set([...this.list(), { id, kind, message }]);
    const timer = setTimeout(() => this.dismiss(id), duration);
    this.timers.set(id, timer);
  }

  ok(message: string): void {
    this.show(message, 'ok');
  }

  error(message: string): void {
    this.show(message, 'err', 5200);
  }

  dismiss(id: number): void {
    const timer = this.timers.get(id);
    if (timer) clearTimeout(timer);
    this.timers.delete(id);
    this.list.set(this.list().filter((t) => t.id !== id));
  }
}