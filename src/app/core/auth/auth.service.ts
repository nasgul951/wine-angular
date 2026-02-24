import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, map, catchError, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthStore } from './auth.store';
import { CredentialsAuthRequest, AuthResponse, UserInfoResponse, SessionInfo } from '../models/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly store = inject(AuthStore);
  private readonly baseUrl = `${environment.apiBaseUrl}/auth`;

  login(req: CredentialsAuthRequest): Observable<boolean> {
    return this.http.post<AuthResponse>(this.baseUrl, req).pipe(
      tap(res => {
        this.store.setToken(res.token);
        this.store.setExpires(res.expires);
      }),
      map(() => true),
      catchError(() => of(false)),
    );
  }

  getUserInfo(): Observable<SessionInfo | null> {
    return this.http.get<UserInfoResponse>(`${this.baseUrl}/userinfo`).pipe(
      map(res => {
        const session: SessionInfo = {
          userId: res.userId,
          userName: res.userName,
          isAdmin: res.isAdmin,
        };
        this.store.setUser(session);
        return session;
      }),
      catchError(() => of(null)),
    );
  }

  logout(): void {
    this.store.logout();
  }
}
