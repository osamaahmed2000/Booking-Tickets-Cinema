import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { I18nService } from '../../../core/i18n/i18n.service';
import { ToastService } from '../../../core/services/toast.service';
import { LogoComponent } from '../../../shared/ui/logo.component';
import { LangSwitchComponent } from '../../../shared/ui/lang-switch.component';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';

@Component({
  selector: 'page-admin-login',
  standalone: true,
  imports: [FormsModule, RouterLink, LogoComponent, LangSwitchComponent, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="login">
      <div class="login__card animate-in">
        <div class="login__head">
          <app-logo />
          <app-lang-switch />
        </div>
        <span class="kicker">{{ 'AD_LOGIN_SUB' | tr }}</span>
        <h1 class="login__title">{{ 'AD_LOGIN_TITLE' | tr }}</h1>

        <form (ngSubmit)="submit()" class="login__form">
          <div class="field">
            <label>{{ 'AD_LOGIN_USER' | tr }}</label>
            <input class="input" [(ngModel)]="username" name="username" autocomplete="username" />
          </div>
          <div class="field">
            <label>{{ 'AD_LOGIN_PASS' | tr }}</label>
            <input class="input" type="password" [(ngModel)]="password" name="password" autocomplete="current-password" />
          </div>
          @if (error()) {
            <div class="form-error" style="margin-bottom:8px">{{ 'AD_LOGIN_ERR' | tr }}</div>
          }
          <button type="submit" class="btn btn--gold btn--block btn--lg">{{ 'AD_LOGIN_BTN' | tr }}</button>
        </form>

        <p class="login__hint">{{ 'AD_LOGIN_HINT' | tr }}</p>
        <a class="login__back" routerLink="/">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M11 6l-6 6 6 6" stroke-linecap="round" stroke-linejoin="round"/></svg>
          {{ 'AD_BACK_SITE' | tr }}
        </a>
      </div>
    </div>
  `,
  styles: `
    .login { min-height: 100vh; display: grid; place-items: center; padding: 24px; background: radial-gradient(90% 60% at 50% 0%, #171209 0%, var(--bg) 55%); }
    .login__card { width: min(420px, 100%); background: linear-gradient(180deg, var(--surface), var(--bg-2)); border: 1px solid var(--line-strong); border-radius: 20px; padding: 34px; box-shadow: var(--shadow-lg); }
    .login__head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 40px; }
    .login__title { font-size: 30px; margin: 4px 0 26px; }
    .login__form { display: flex; flex-direction: column; gap: 2px; }
    .login__hint { text-align: center; color: var(--text-3); font-size: 12.5px; margin-top: 18px; }
    .login__back { display: inline-flex; align-items: center; gap: 8px; color: var(--text-3); font-size: 13px; margin-top: 14px; }
    .login__back svg { transform: scaleX(-1); }
    html[dir='rtl'] .login__back svg { transform: none; }
    .login__back:hover { color: var(--gold); }
  `,
  host: { class: 'page-login' },
})
export class LoginComponent {
  username = '';
  password = '';
  readonly error = signal(false);

  constructor(
    private auth: AuthService,
    private i18n: I18nService,
    private toast: ToastService,
    private router: Router,
  ) {}

  submit(): void {
    if (this.auth.login(this.username, this.password)) {
      this.error.set(false);
      this.toast.ok(this.i18n.t('TOAST_LOGIN_OK', { name: this.username || 'admin' }));
      this.router.navigate(['/admin/dashboard']);
    } else {
      this.error.set(true);
      this.toast.error(this.i18n.t('AD_LOGIN_ERR'));
    }
  }
}