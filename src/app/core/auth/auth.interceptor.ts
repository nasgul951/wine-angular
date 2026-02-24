import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { EMPTY, catchError, throwError } from 'rxjs';
import { AuthStore } from './auth.store';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const store = inject(AuthStore);
  const router = inject(Router);

  // Don't attach token to the login endpoint
  if (req.url.endsWith('/auth') && req.method === 'POST') {
    return next(req);
  }

  const token = store.token();
  if (token) {
    // Proactive: check expiration before sending
    if (store.isTokenExpired()) {
      store.logout();
      router.navigate(['/login'], { queryParams: { expired: true } });
      return EMPTY;
    }

    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    });
  }

  // Reactive: catch 401 responses
  return next(req).pipe(
    catchError(err => {
      if (err instanceof HttpErrorResponse && err.status === 401) {
        store.logout();
        router.navigate(['/login'], { queryParams: { expired: true } });
      }
      return throwError(() => err);
    }),
  );
};
