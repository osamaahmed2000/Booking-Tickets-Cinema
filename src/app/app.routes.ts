import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/site/home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'movies',
    loadComponent: () =>
      import('./features/site/movies/movies.component').then((m) => m.MoviesComponent),
  },
  {
    path: 'movie/:id',
    loadComponent: () =>
      import('./features/site/movie/movie-details.component').then((m) => m.MovieDetailsComponent),
  },
  {
    path: 'movie/:id/select',
    loadComponent: () =>
      import('./features/site/seats/seats.component').then((m) => m.SeatsComponent),
  },
  {
    path: 'checkout',
    loadComponent: () =>
      import('./features/site/checkout/checkout.component').then((m) => m.CheckoutComponent),
  },
  {
    path: 'confirmation/:code',
    loadComponent: () =>
      import('./features/site/confirmation/confirmation.component').then(
        (m) => m.ConfirmationComponent,
      ),
  },
  {
    path: 'bookings',
    loadComponent: () =>
      import('./features/site/bookings/bookings.component').then((m) => m.BookingsComponent),
  },
  {
    path: 'admin',
    loadChildren: () => import('./features/admin/admin.routes').then((m) => m.adminRoutes),
  },
  {
    path: '**',
    loadComponent: () =>
      import('./features/site/not-found/not-found.component').then((m) => m.NotFoundComponent),
  },
];