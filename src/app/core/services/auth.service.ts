import { Injectable, signal } from '@angular/core';
import { StorageService } from './storage.service';

const KEY = 'noir:admin';

const USERS = [{ username: 'admin', password: 'admin123' }];

@Injectable({ providedIn: 'root' })
export class AuthService {
  readonly authed = signal(false);
  readonly username = signal('');

  constructor(private storage: StorageService) {
    const session = this.storage.get<{ username: string }>(KEY);
    if (session?.username) {
      this.authed.set(true);
      this.username.set(session.username);
    }
  }

  login(username: string, password: string): boolean {
    const ok = USERS.some(
      (u) => u.username === username.trim().toLowerCase() && u.password === password,
    );
    if (ok) {
      this.authed.set(true);
      this.username.set(username.trim());
      this.storage.set(KEY, { username: username.trim() });
    }
    return ok;
  }

  logout(): void {
    this.authed.set(false);
    this.username.set('');
    this.storage.remove(KEY);
  }
}