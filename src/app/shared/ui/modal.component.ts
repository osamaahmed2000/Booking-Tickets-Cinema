import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { TranslatePipe } from '../pipes/translate.pipe';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (open) {
      <div class="modal" (click)="close.emit()">
        <div class="modal__card" (click)="$event.stopPropagation()" role="dialog" aria-modal="true">
          <div class="modal__head">
            <h3 class="modal__title">{{ title }}</h3>
            <button type="button" class="modal__x" (click)="close.emit()" aria-label="{{ 'C_CLOSE' | tr }}">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M2 2l12 12M14 2L2 14" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
              </svg>
            </button>
          </div>
          <div class="modal__body">
            <ng-content></ng-content>
          </div>
        </div>
      </div>
    }
  `,
  styles: `
    .modal {
      position: fixed; inset: 0; z-index: 2200; display: flex; align-items: center; justify-content: center;
      background: rgba(4, 4, 6, 0.72); backdrop-filter: blur(8px); padding: 20px;
      animation: fadeIn 0.25s ease both;
    }
    .modal__card {
      width: min(560px, 100%); max-height: 88vh; overflow: auto; background: var(--bg-2);
      border: 1px solid var(--line-strong); border-radius: 18px; box-shadow: var(--shadow-lg);
      animation: pop 0.4s var(--ease) both;
    }
    .modal__head { display: flex; align-items: center; justify-content: space-between; padding: 18px 22px; border-bottom: 1px solid var(--line); }
    .modal__title { font-size: 17px; }
    .modal__x { border: 0; background: transparent; color: var(--text-3); padding: 6px; display: grid; place-items: center; border-radius: 8px; }
    .modal__x:hover { color: var(--text); background: var(--surface-2); }
    .modal__body { padding: 22px; }
    @keyframes pop { from { opacity: 0; transform: translateY(16px) scale(0.98); } to { opacity: 1; transform: none; } }
  `,
})
export class ModalComponent {
  @Input() open = false;
  @Input() title = '';
  @Output() close = new EventEmitter<void>();
}