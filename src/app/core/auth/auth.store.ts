import { Injectable, signal, computed } from '@angular/core';
import { SessionInfo } from '../models/auth.model';

const SESSION_KEY = 'session-key';

@Injectable({ providedIn: 'root' })
export class AuthStore {
  private readonly _token = signal<string | null>(localStorage.getItem(SESSION_KEY));
  private readonly _user = signal<SessionInfo | null>(null);

  readonly token = this._token.asReadonly();
  readonly user = this._user.asReadonly();
  readonly isAuthenticated = computed(() => !!this._token());
  readonly isAdmin = computed(() => this._user()?.isAdmin ?? false);

  setToken(token: string): void {
    localStorage.setItem(SESSION_KEY, token);
    this._token.set(token);
  }

  setUser(user: SessionInfo): void {
    this._user.set(user);
  }

  logout(): void {
    localStorage.removeItem(SESSION_KEY);
    this._token.set(null);
    this._user.set(null);
  }
}
