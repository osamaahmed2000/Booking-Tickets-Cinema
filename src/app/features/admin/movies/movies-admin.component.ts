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
  template: `
    <div class="page-head animate-in">
      <div>
        <span class="kicker">{{ 'AD_NAV_MOVIES' | tr }}</span>
        <h1 class="page-head__title">{{ 'AD_MOV_TITLE' | tr }}</h1>
      </div>
      <a class="btn btn--gold btn--sm" routerLink="/admin/movies/new">+ {{ 'AD_MOV_ADD' | tr }}</a>
    </div>

    @if (movies().length === 0) {
      <div class="card empty-note" style="padding-block:70px">{{ 'AD_MOV_NO' | tr }}</div>
    } @else {
      <div class="card tbl-wrap">
        <div class="tbl" role="table">
          <div class="tbl__row tbl__row--head" role="row">
            <span>{{ 'AD_MOV_ACTIONS'.length ? 'Film' : '' }}</span>
            <span>{{ 'AD_MOV_STATUS' | tr }}</span>
            <span>{{ 'AD_MOV_YEAR' | tr }} · {{ 'AD_MOV_RATING' | tr }}</span>
            <span>{{ 'AD_MOV_ACTIONS' | tr }}</span>
          </div>
          @for (m of movies(); track m.id) {
            <div class="tbl__row" role="row">
              <div class="cell-film">
                <a class="cell-film__thumb" [routerLink]="['/admin/movies', m.id]">
                  @if (m.art) { <app-poster [art]="m.art" [title]="m.title | local" [year]="m.year" /> }
                </a>
                <div>
                  <b class="cell-film__title">{{ m.title | local }}</b>
                  <span class="cell-film__genres">{{ genres(m) }}</span>
                </div>
              </div>
              <span>
                <span class="badge" [class.badge--now]="m.status === 'now'" [class.badge--soon]="m.status === 'soon'">
                  {{ m.status === 'now' ? ('AD_MOV_NOW' | tr) : ('AD_MOV_SOON' | tr) }}
                </span>
              </span>
              <span class="cell-meta">{{ m.year }} · {{ m.rating.toFixed(1) }} · {{ m.durationMin }}'</span>
              <div class="cell-actions">
                <a class="btn btn--dark btn--sm" [routerLink]="['/admin/movies', m.id]">{{ 'C_EDIT' | tr }}</a>
                <button type="button" class="btn btn--ghost btn--sm" (click)="askDelete(m)">{{ 'C_DELETE' | tr }}</button>
              </div>
            </div>
          }
        </div>
      </div>
    }

    <app-modal [open]="target() !== null" [title]="'C_DELETE_TITLE' | tr" (close)="target.set(null)">
      <p style="color: var(--text-2); margin-bottom: 20px;">
        {{ 'C_DELETE_BODY' | tr }}
        @if (target(); as m) { <b style="color: var(--text)">“{{ m.title | local }}”</b> }
      </p>
      <div class="modal-actions">
        <button type="button" class="btn btn--line" (click)="target.set(null)">{{ 'C_CANCEL' | tr }}</button>
        <button type="button" class="btn btn--danger" (click)="confirmDelete()">{{ 'C_YES' | tr }}</button>
      </div>
    </app-modal>
  `,
  styles: `
    .page-head { display: flex; align-items: flex-end; justify-content: space-between; gap: 16px; margin-bottom: 24px; flex-wrap: wrap; }
    .page-head__title { font-size: clamp(26px, 4vw, 38px); }
    .tbl { display: flex; flex-direction: column; }
    .tbl__row { display: grid; grid-template-columns: 2fr 130px 190px auto; gap: 14px; align-items: center; padding: 14px 20px; border-top: 1px solid var(--line); font-size: 13.5px; }
    .tbl__row--head { color: var(--text-3); font-size: 11px; letter-spacing: .16em; text-transform: uppercase; font-weight: 700; border-top: 0; }
    .cell-film { display: flex; align-items: center; gap: 14px; min-width: 0; }
    .cell-film__thumb { width: 40px; aspect-ratio: 2/3; border-radius: 6px; overflow: hidden; flex-shrink: 0; }
    .cell-film__title { display: block; font-size: 15px; margin-bottom: 3px; }
    .cell-film__genres { font-size: 12px; color: var(--text-3); display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 34ch; }
    .cell-meta { color: var(--text-2); }
    .cell-actions { display: flex; gap: 8px; justify-content: flex-end; }
    .badge { display: inline-flex; padding: 5px 12px; border-radius: 999px; font-size: 11.5px; font-weight: 700; letter-spacing: .03em; }
    .badge--now { color: var(--green); background: rgba(134,181,141,.1); border: 1px solid rgba(134,181,141,.32); }
    .badge--soon { color: var(--gold); background: var(--gold-dim); border: 1px solid rgba(201,164,102,.35); }
    .modal-actions { display: flex; gap: 10px; justify-content: flex-end; }
    @media (max-width: 820px) {
      .tbl__row { grid-template-columns: 1.6fr 100px auto; }
      .tbl__row--head { display: none; }
      .cell-meta { display: none; }
    }
    @media (max-width: 560px) { .cell-film__genres { display: none; } }
  `,
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