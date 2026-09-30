import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-toasts',
  standalone: true,
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="toasts">
      @for (toast of toasts; track toast.id) {
        <div class="toast toast--{{ toast.kind }}" (click)="dismiss(toast.id)">
          <span class="toast__dot"></span>
          <span class="toast__msg">{{ toast.message }}</span>
          <button type="button" class="toast__x" aria-label="close">×</button>
        </div>
      }
    </div>
  `,
  styles: `
    .toasts {
      position: fixed; bottom: 22px; inset-inline: 22px; z-index: 3000;
      display: flex; flex-direction: column; align-items: center; gap: 10px; pointer-events: none;
    }
    .toast {
      pointer-events: auto; display: flex; align-items: center; gap: 12px;
      background: rgba(18, 18, 22, 0.92); border: 1px solid var(--line-strong);
      backdrop-filter: blur(14px); border-radius: 12px; padding: 12px 18px;
      box-shadow: var(--shadow-md); max-width: 420px; width: max-content;
      animation: rise 0.45s var(--ease) both; cursor: pointer; font-size: 14px; font-weight: 500;
    }
    .toast__dot { width: 9px; height: 9px; border-radius: 50%; background: var(--gold); flex-shrink: 0; }
    .toast--ok .toast__dot { background: var(--green); box-shadow: 0 0 12px var(--green); }
    .toast--err .toast__dot { background: var(--red); box-shadow: 0 0 12px var(--red); }
    .toast__msg { color: var(--text); }
    .toast__x { border: 0; background: transparent; color: var(--text-3); font-size: 18px; line-height: 1; padding: 0 2px; }
    .toast__x:hover { color: var(--text); }
    @keyframes rise { from { opacity: 0; transform: translateY(14px) scale(0.97); } to { opacity: 1; transform: none; } }
  `,
})
export class ToastsComponent {
  constructor(private toast: ToastService) {}

  get toasts() {
    return this.toast.toasts();
  }

  dismiss(id: number): void {
    this.toast.dismiss(id);
  }
}