import { Component, OnDestroy, signal } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { Subscription } from 'rxjs';
import { HeaderComponent } from './shared/ui/header.component';
import { FooterComponent } from './shared/ui/footer.component';
import { ToastsComponent } from './shared/ui/toasts.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent, ToastsComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnDestroy {
  readonly isAdmin = signal(false);
  private sub: Subscription;

  constructor(router: Router) {
    this.sub = router.events.subscribe((e) => {
      if (e instanceof NavigationEnd) {
        this.isAdmin.set(e.urlAfterRedirects.startsWith('/admin'));
        if (e.urlAfterRedirects !== '/') window.scrollTo({ top: 0 });
      }
    });
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}