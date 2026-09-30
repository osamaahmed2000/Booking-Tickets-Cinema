import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import type { Movie } from '../../core/models';
import { PosterComponent } from './poster.component';
import { LocalizePipe } from '../pipes/localize.pipe';
import { TranslatePipe } from '../pipes/translate.pipe';

@Component({
  selector: 'app-movie-card',
  standalone: true,
  imports: [RouterLink, PosterComponent, LocalizePipe, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './movie-card.component.html',
  styleUrl: './movie-card.component.scss',
})
export class MovieCardComponent {
  readonly movie = input.required<Movie>();
}