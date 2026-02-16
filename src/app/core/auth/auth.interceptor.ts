import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthStore } from './auth.store';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const store = inject(AuthStore);

  // Don't attach token to the login endpoint
  if (req.url.endsWith('/auth') && req.method === 'POST') {
    return next(req);
  }

  const token = store.token();
  if (token) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    });
  }

  return next(req);
};
