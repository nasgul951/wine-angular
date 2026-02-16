import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { adminGuard } from './admin.guard';
import { AuthStore } from './auth.store';

describe('adminGuard', () => {
  let store: AuthStore;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideRouter([])],
    });
    store = TestBed.inject(AuthStore);
  });

  afterEach(() => localStorage.clear());

  it('returns true when user is admin', () => {
    store.setUser({ userId: 1, userName: 'admin', isAdmin: true });
    const result = TestBed.runInInjectionContext(() => adminGuard({} as any, {} as any));
    expect(result).toBeTrue();
  });

  it('returns false when user is not admin', () => {
    store.setUser({ userId: 2, userName: 'user', isAdmin: false });
    const result = TestBed.runInInjectionContext(() => adminGuard({} as any, {} as any));
    expect(result).toBeFalse();
  });
});
