import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { I18nService } from '../../core/i18n/i18n.service';

@Component({
  selector: 'app-logo',
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './logo.component.html',
  styleUrl: './logo.component.scss',
})
export class LogoComponent {
  readonly tag = input(false);
  readonly brand: string;
  readonly tagLine: string;

  constructor(private i18n: I18nService) {
    this.brand = this.i18n.t('BRAND');
    this.tagLine = this.i18n.t('BRAND_TAG');
  }
}