import { Routes } from '@angular/router';
import { adminGuard } from './admin.guard';
import { LoginComponent } from './login/login.component';
import { AdminLayoutComponent } from './layout/admin-layout.component';

export const adminRoutes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: '',
    canActivate: [adminGuard],
    component: AdminLayoutComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./dashboard/dashboard.component').then((m) => m.AdminDashboardComponent),
      },
      {
        path: 'movies',
        loadComponent: () =>
          import('./movies/movies-admin.component').then((m) => m.MoviesAdminComponent),
      },
      {
        path: 'movies/new',
        loadComponent: () =>
          import('./movie-form/movie-form.component').then((m) => m.MovieFormComponent),
      },
      {
        path: 'movies/:id',
        loadComponent: () =>
          import('./movie-form/movie-form.component').then((m) => m.MovieFormComponent),
      },
      {
        path: 'halls',
        loadComponent: () =>
          import('./halls/halls.component').then((m) => m.HallsComponent),
      },
      {
        path: 'showtimes',
        loadComponent: () =>
          import('./showtimes/showtimes.component').then((m) => m.ShowtimesComponent),
      },
      {
        path: 'bookings',
        loadComponent: () =>
          import('./bookings/bookings-admin.component').then((m) => m.BookingsAdminComponent),
      },
    ],
  },
];