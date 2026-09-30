import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DataService } from '../../../core/services/data.service';
import { I18nService } from '../../../core/i18n/i18n.service';
import { ToastService } from '../../../core/services/toast.service';
import type { ArtConfig, ArtStyle, Localized, Movie } from '../../../core/models';
import { makeId } from '../../../core/utils';
import { PosterComponent } from '../../../shared/ui/poster.component';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';

const STYLES: ArtStyle[] = ['surge', 'orbit', 'monolith', 'horizon', 'prism', 'veil', 'arc', 'grid', 'cross'];

const PRESETS: { name: string; art: ArtConfig }[] = [
  { name: 'Ember', art: { style: 'surge', bg: ['#14060f', '#04010a'], accent: '#ff4d8d', accent2: '#7c4dff' } },
  { name: 'Abyss', art: { style: 'orbit', bg: ['#050b1c', '#000208'], accent: '#7aa7ff', accent2: '#c9a466' } },
  { name: 'Ivory', art: { style: 'monolith', bg: ['#0a0a0c', '#000000'], accent: '#d9d4c8', accent2: '#5a5650' } },
  { name: 'Crimson', art: { style: 'horizon', bg: ['#170605', '#020101'], accent: '#e2574b', accent2: '#2c4a6e' } },
  { name: 'Solar', art: { style: 'prism', bg: ['#170d05', '#040201'], accent: '#f2a65a', accent2: '#4b9fe8' } },
  { name: 'Rose', art: { style: 'veil', bg: ['#150a14', '#050206'], accent: '#e8a8c8', accent2: '#8e6bb0' } },
  { name: 'Gilded', art: { style: 'arc', bg: ['#191104', '#030100'], accent: '#e6b463', accent2: '#324a2f' } },
  { name: 'Mint', art: { style: 'grid', bg: ['#0a1414', '#010303'], accent: '#3fbfaf', accent2: '#e2574b' } },
  { name: 'Violet', art: { style: 'cross', bg: ['#0d0a16', '#020105'], accent: '#b79aef', accent2: '#e6c98f' } },
];

@Component({
  selector: 'admin-movie-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, PosterComponent, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (ready) {
      <div class="mf animate-in">
        <div class="page-head">
          <div>
            <a class="back" routerLink="/admin/movies">← {{ 'C_BACK' | tr }}</a>
            <h1 class="page-head__title">{{ editing ? ('AD_MOV_EDIT' | tr) : ('AD_MOV_ADD' | tr) }}</h1>
          </div>
        </div>

        <div class="mf__grid">
          <form class="mf__form" [formGroup]="form">
            <div class="card block">
              <div class="block__head"><h3>{{ 'AD_MOV_LANG' | tr }}</h3></div>
              <div class="form-row">
                <div class="field" style="min-width:0">
                  <label>{{ 'AD_MOV_TITLE_EN' | tr }}</label>
                  <input class="input" formControlName="titleEn" />
                </div>
                <div class="field" style="min-width:0">
                  <label>{{ 'AD_MOV_TITLE_AR' | tr }}</label>
                  <input class="input" formControlName="titleAr" />
                </div>
              </div>
              <div class="form-row">
                <div class="field" style="min-width:0">
                  <label>{{ 'AD_MOV_TAG_EN' | tr }}</label>
                  <input class="input" formControlName="tagEn" />
                </div>
                <div class="field" style="min-width:0">
                  <label>{{ 'AD_MOV_TAG_AR' | tr }}</label>
                  <input class="input" formControlName="tagAr" />
                </div>
              </div>
              <div class="field">
                <label>{{ 'AD_MOV_OVERVIEW_EN' | tr }}</label>
                <textarea class="textarea" formControlName="overviewEn"></textarea>
              </div>
              <div class="field">
                <label>{{ 'AD_MOV_OVERVIEW_AR' | tr }}</label>
                <textarea class="textarea" formControlName="overviewAr"></textarea>
              </div>
              <div class="form-row">
                <div class="field" style="min-width:0">
                  <label>{{ 'AD_MOV_GENRES_EN' | tr }}</label>
                  <input class="input" formControlName="genresEn" placeholder="Sci-Fi, Thriller" />
                </div>
                <div class="field" style="min-width:0">
                  <label>{{ 'AD_MOV_GENRES_AR' | tr }}</label>
                  <input class="input" formControlName="genresAr" placeholder="خيال علمي، إثارة" />
                </div>
              </div>
              <div class="form-row">
                <div class="field" style="min-width:0">
                  <label>{{ 'AD_MOV_DIR_EN' | tr }}</label>
                  <input class="input" formControlName="dirEn" />
                </div>
                <div class="field" style="min-width:0">
                  <label>{{ 'AD_MOV_DIR_AR' | tr }}</label>
                  <input class="input" formControlName="dirAr" />
                </div>
              </div>
              <div class="form-row">
                <div class="field" style="min-width:0">
                  <label>{{ 'AD_MOV_CAST_EN' | tr }}</label>
                  <input class="input" formControlName="castEn" placeholder="A, B, C" />
                </div>
                <div class="field" style="min-width:0">
                  <label>{{ 'AD_MOV_CAST_AR' | tr }}</label>
                  <input class="input" formControlName="castAr" placeholder="أ، ب، ج" />
                </div>
              </div>
            </div>

            <div class="card block">
              <div class="block__head"><h3>{{ 'AD_MOV_STATUS' | tr }}</h3></div>
              <div class="form-row">
                <div class="field" style="min-width:0">
                  <label>{{ 'AD_MOV_STATUS' | tr }}</label>
                  <select class="select" formControlName="status">
                    <option value="now">{{ 'AD_MOV_NOW' | tr }}</option>
                    <option value="soon">{{ 'AD_MOV_SOON' | tr }}</option>
                  </select>
                </div>
                <div class="field" style="min-width:0">
                  <label>{{ 'AD_MOV_BADGE' | tr }}</label>
                  <input class="input" formControlName="badge" placeholder="IMAX / 3D" />
                </div>
              </div>
              <div class="form-row">
                <div class="field" style="min-width:0">
                  <label>{{ 'AD_MOV_YEAR' | tr }}</label>
                  <input class="input" type="number" formControlName="year" />
                </div>
                <div class="field" style="min-width:0">
                  <label>{{ 'AD_MOV_DUR' | tr }}</label>
                  <input class="input" type="number" formControlName="duration" />
                </div>
                <div class="field" style="min-width:0">
                  <label>{{ 'AD_MOV_RATING' | tr }}</label>
                  <input class="input" type="number" step="0.1" min="0" max="10" formControlName="rating" />
                </div>
                <div class="field" style="min-width:0">
                  <label>{{ 'AD_MOV_AGE' | tr }}</label>
                  <input class="input" formControlName="age" placeholder="13+" />
                </div>
              </div>
            </div>

            <div class="card block">
              <div class="block__head"><h3>{{ 'AD_MOV_STYLE' | tr }}</h3></div>
              <div class="press">
                @for (p of presets; track p.name) {
                  <button type="button" class="press__chip" (click)="applyPreset(p.art)">
                    <i [style.background]="'linear-gradient(135deg, ' + p.art.bg[0] + ', ' + p.art.bg[1] + ')'"></i>
                    <span>{{ p.name }}</span>
                  </button>
                }
              </div>
              <div class="form-row" style="margin-top:18px">
                <div class="field" style="min-width:0">
                  <label>{{ 'AD_MOV_STYLE' | tr }} (style)</label>
                  <select class="select" formControlName="style">
                    @for (s of styles; track s) { <option [value]="s">{{ s }}</option> }
                  </select>
                </div>
                <div class="field" style="min-width:0">
                  <label>Accent</label>
                  <input class="input" type="color" formControlName="accent" style="height:46px; padding:4px; cursor:pointer" />
                </div>
                <div class="field" style="min-width:0">
                  <label>Accent 2</label>
                  <input class="input" type="color" formControlName="accent2" style="height:46px; padding:4px; cursor:pointer" />
                </div>
              </div>
            </div>

            <div class="mf__save">
              <button type="button" class="btn btn--line" routerLink="/admin/movies">{{ 'C_CANCEL' | tr }}</button>
              <button type="button" class="btn btn--gold" (click)="save()">{{ 'AD_MOV_SAVE' | tr }}</button>
            </div>
          </form>

          <div class="mf__preview">
            <div class="mf__preview-sticky">
              <span class="kicker">{{ 'AD_MOV_STYLE' | tr }}</span>
              <div class="mf__poster" [style.--bg0]="form.value.bg0" [style.--bg1]="form.value.bg1">
                <app-poster
                  [art]="previewArt"
                  [title]="form.value.titleEn || 'Untitled'"
                  [year]="form.value.year || ''"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    }
  `,
  styles: `
    .page-head { margin-bottom: 22px; }
    .back { display: inline-block; color: var(--text-3); font-size: 13px; margin-bottom: 10px; }
    .back:hover { color: var(--gold); }
    .page-head__title { font-size: clamp(26px, 4vw, 36px); }
    .mf__grid { display: grid; grid-template-columns: 1fr 260px; gap: 22px; align-items: start; }
    @media (max-width: 980px) { .mf__grid { grid-template-columns: 1fr; } }
    .mf__form { display: flex; flex-direction: column; gap: 18px; }
    .block { padding: 20px 22px; }
    .block__head h3 { font-size: 15px; margin-bottom: 16px; }
    .press { display: flex; flex-wrap: wrap; gap: 8px; }
    .press__chip { display: inline-flex; align-items: center; gap: 8px; padding: 6px 12px 6px 6px; border-radius: 999px; background: var(--surface); border: 1px solid var(--line); color: var(--text-2); font-size: 12px; font-weight: 600; transition: all .2s; }
    .press__chip:hover { border-color: var(--gold); color: var(--text); }
    .press__chip i { width: 20px; height: 20px; border-radius: 50%; border: 1px solid var(--line-strong); }
    .mf__save { display: flex; gap: 10px; justify-content: flex-end; }
    .mf__preview-sticky { position: sticky; top: 20px; }
    .mf__poster { border-radius: 14px; overflow: hidden; aspect-ratio: 2/3; box-shadow: var(--shadow-md); }
  `,
  host: { class: 'page-admin-crud' },
})
export class MovieFormComponent {
  readonly styles = STYLES;
  readonly presets = PRESETS;
  readonly form!: FormGroup;

  ready = false;
  editing = false;

  constructor(
    private fb: FormBuilder,
    private data: DataService,
    private i18n: I18nService,
    private toast: ToastService,
    private router: Router,
    route: ActivatedRoute,
  ) {
    this.form = this.fb.group({
      id: [''],
      titleEn: [''],
      titleAr: [''],
      tagEn: [''],
      tagAr: [''],
      overviewEn: [''],
      overviewAr: [''],
      genresEn: [''],
      genresAr: [''],
      dirEn: [''],
      dirAr: [''],
      castEn: [''],
      castAr: [''],
      status: ['now'],
      badge: [''],
      year: [2026],
      duration: [110],
      rating: [8],
      age: ['13+'],
      style: ['surge'],
      bg0: ['#0a0a0c'],
      bg1: ['#000000'],
      accent: ['#c9a466'],
      accent2: ['#7a5c2e'],
    });

    const id = route.snapshot.paramMap.get('id');
    if (id) {
      const m = this.data.movies().find((x) => x.id === id);
      if (m) this.patch(m);
    }
    this.ready = true;
  }

  private split(v: string): string[] {
    return v.split(',').map((s) => s.trim()).filter(Boolean);
  }

  private patch(m: Movie): void {
    this.editing = true;
    this.form.patchValue({
      id: m.id,
      titleEn: m.title.en,
      titleAr: m.title.ar,
      tagEn: m.tagline.en,
      tagAr: m.tagline.ar,
      overviewEn: m.overview.en,
      overviewAr: m.overview.ar,
      genresEn: m.genres.map((g) => g.en).join(', '),
      genresAr: m.genres.map((g) => g.ar).join(', '),
      dirEn: m.director.en,
      dirAr: m.director.ar,
      castEn: m.cast.map((c) => c.en).join(', '),
      castAr: m.cast.map((c) => c.ar).join(', '),
      status: m.status,
      badge: m.badge ?? '',
      year: m.year,
      duration: m.durationMin,
      rating: m.rating,
      age: m.age,
      style: m.art.style,
      bg0: m.art.bg[0],
      bg1: m.art.bg[1],
      accent: m.art.accent,
      accent2: m.art.accent2,
    });
  }

  get previewArt(): ArtConfig {
    const v = this.form.value;
    return {
      style: (v.style as ArtStyle) ?? 'surge',
      bg: [v.bg0 ?? '#0a0a0c', v.bg1 ?? '#000000'],
      accent: v.accent ?? '#c9a466',
      accent2: v.accent2 ?? '#7a5c2e',
    };
  }

  applyPreset(art: ArtConfig): void {
    this.form.patchValue({
      style: art.style,
      bg0: art.bg[0],
      bg1: art.bg[1],
      accent: art.accent,
      accent2: art.accent2,
    });
  }

  save(): void {
    const v = this.form.value;
    const genresEn = this.split(v.genresEn ?? '');
    const genresAr = this.split(v.genresAr ?? '');
    const castEn = this.split(v.castEn ?? '');
    const castAr = this.split(v.castAr ?? '');
    const genres: Localized[] = genresEn.map((en, i) => ({ en, ar: genresAr[i] ?? en }));
    const cast: Localized[] = castEn.map((en, i) => ({ en, ar: castAr[i] ?? en }));

    const movie: Movie = {
      id: v.id || makeId('mv'),
      title: { en: v.titleEn || 'Untitled', ar: v.titleAr || v.titleEn || 'بدون عنوان' },
      tagline: { en: v.tagEn ?? '', ar: v.tagAr ?? v.tagEn ?? '' },
      overview: { en: v.overviewEn ?? '', ar: v.overviewAr ?? v.overviewEn ?? '' },
      status: v.status === 'soon' ? 'soon' : 'now',
      year: Number(v.year) || 2026,
      durationMin: Number(v.duration) || 100,
      rating: Math.min(10, Math.max(0, Number(v.rating) || 0)),
      age: v.age || 'PG',
      genres: genres.length ? genres : [{ en: 'Drama', ar: 'دراما' }],
      badge: v.badge || undefined,
      director: { en: v.dirEn || '—', ar: v.dirAr || v.dirEn || '—' },
      cast: cast.length ? cast : [{ en: '—', ar: '—' }],
      art: this.previewArt,
    };

    this.data.saveMovie(movie);
    this.toast.ok(this.i18n.t('TOAST_UPDATED'));
    this.router.navigate(['/admin/movies']);
  }
}