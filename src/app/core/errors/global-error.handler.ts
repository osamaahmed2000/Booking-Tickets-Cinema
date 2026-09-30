import { ErrorHandler, Injectable } from '@angular/core';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  private shown = false;

  handleError(error: unknown): void {
    try {
      const message =
        error instanceof Error
          ? `${error.message}\n${error.stack ?? ''}`
          : String(error);
      if (!this.shown) {
        this.shown = true;
        const el = document.createElement('div');
        el.id = 'noir-fatal';
        el.style.cssText =
          'position:fixed;inset:12px auto auto 12px;max-width:min(520px,calc(100vw - 24px));z-index:99999;background:#170b0b;color:#ffb4ac;font:12px/1.55 Consolas,monospace;white-space:pre-wrap;padding:14px 16px;border:1px solid #7a2a22;border-radius:10px;box-shadow:0 12px 40px rgba(0,0,0,.5)';
        el.textContent = `NOIR app error — please share this:\n\n${message}`;
        document.body.appendChild(el);
      }
    } catch {
      /* last resort: swallow */
    }
    console.error(error);
  }
}