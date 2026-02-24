import { Injectable, signal, computed } from '@angular/core';
import { SessionInfo } from '../models/auth.model';

const SESSION_KEY = 'session-key';
const EXPIRES_KEY = 'session-expires';

@Injectable({ providedIn: 'root' })
export class AuthStore {
  private readonly _token = signal<string | null>(localStorage.getItem(SESSION_KEY));
  private readonly _user = signal<SessionInfo | null>(null);
  private readonly _expires = signal<Date | null>(this.loadExpires());

  readonly token = this._token.asReadonly();
  readonly user = this._user.asReadonly();
  readonly expires = this._expires.asReadonly();
  readonly isAuthenticated = computed(() => !!this._token());
  readonly isAdmin = computed(() => this._user()?.isAdmin ?? false);

  setToken(token: string): void {
    localStorage.setItem(SESSION_KEY, token);
    this._token.set(token);
  }

  setExpires(expires: Date): void {
    localStorage.setItem(EXPIRES_KEY, new Date(expires).toISOString());
    this._expires.set(new Date(expires));
  }

  setUser(user: SessionInfo): void {
    this._user.set(user);
  }

  isTokenExpired(): boolean {
    const exp = this._expires();
    return exp ? exp.getTime() <= Date.now() : false;
  }

  logout(): void {
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(EXPIRES_KEY);
    this._token.set(null);
    this._user.set(null);
    this._expires.set(null);
  }

  private loadExpires(): Date | null {
    const val = localStorage.getItem(EXPIRES_KEY);
    return val ? new Date(val) : null;
  }
}
