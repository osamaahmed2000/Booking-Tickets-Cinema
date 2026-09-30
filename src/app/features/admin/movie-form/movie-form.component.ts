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
  templateUrl: './movie-form.component.html',
  styleUrl: './movie-form.component.scss',
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