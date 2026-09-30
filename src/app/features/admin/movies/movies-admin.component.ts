import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DataService } from '../../../core/services/data.service';
import { I18nService } from '../../../core/i18n/i18n.service';
import { ToastService } from '../../../core/services/toast.service';
import type { Movie } from '../../../core/models';
import { PosterComponent } from '../../../shared/ui/poster.component';
import { ModalComponent } from '../../../shared/ui/modal.component';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { LocalizePipe } from '../../../shared/pipes/localize.pipe';

@Component({
  selector: 'admin-movies',
  standalone: true,
  imports: [RouterLink, PosterComponent, ModalComponent, TranslatePipe, LocalizePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './movies-admin.component.html',
  styleUrl: './movies-admin.component.scss',
  host: { class: 'page-admin-crud' },
})
export class MoviesAdminComponent {
  readonly target = signal<Movie | null>(null);

  constructor(
    private data: DataService,
    private i18n: I18nService,
    private toast: ToastService,
  ) {}

  movies() {
    return this.data.movies();
  }

  genres(m: Movie): string {
    return m.genres.map((g) => g[this.i18n.lang()]).join(', ');
  }

  askDelete(m: Movie): void {
    this.target.set(m);
  }

  confirmDelete(): void {
    const m = this.target();
    if (!m) return;
    this.data.deleteMovie(m.id);
    this.target.set(null);
    this.toast.ok(this.i18n.t('TOAST_DELETED'));
  }
}