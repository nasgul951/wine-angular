import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { AuthStore } from './auth.store';

export const adminGuard: CanActivateFn = () => {
  const store = inject(AuthStore);
  return store.isAdmin();
};
