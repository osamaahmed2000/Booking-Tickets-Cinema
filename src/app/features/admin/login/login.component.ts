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
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
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