import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DataService } from '../../core/services/data.service';
import { I18nService } from '../../core/i18n/i18n.service';
import { LogoComponent } from './logo.component';
import { LangSwitchComponent } from './lang-switch.component';
import { TranslatePipe } from '../pipes/translate.pipe';
import { LocalizePipe } from '../pipes/localize.pipe';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink, LogoComponent, LangSwitchComponent, TranslatePipe, LocalizePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss',
})
export class FooterComponent {
  readonly year = new Date().getFullYear();
  readonly settings: ReturnType<DataService['settings']>;

  constructor(private data: DataService) {
    this.settings = this.data.settings();
  }
}