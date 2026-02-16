import { TestBed } from '@angular/core/testing';
import { AuthStore } from './auth.store';
import { SessionInfo } from '../models/auth.model';

describe('AuthStore', () => {
  let store: AuthStore;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    store = TestBed.inject(AuthStore);
  });

  afterEach(() => localStorage.clear());

  it('reads initial token from localStorage', () => {
    localStorage.setItem('session-key', 'stored-token');
    // Need a fresh instance to pick up the stored value
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});
    const fresh = TestBed.inject(AuthStore);
    expect(fresh.token()).toBe('stored-token');
  });

  it('has null user initially', () => {
    expect(store.user()).toBeNull();
  });

  it('isAuthenticated reflects token presence', () => {
    expect(store.isAuthenticated()).toBeFalse();
    store.setToken('abc');
    expect(store.isAuthenticated()).toBeTrue();
  });

  it('setToken updates signal and writes to localStorage', () => {
    store.setToken('my-token');
    expect(store.token()).toBe('my-token');
    expect(localStorage.getItem('session-key')).toBe('my-token');
  });

  it('setUser updates user signal and isAdmin computed', () => {
    const user: SessionInfo = { userId: 1, userName: 'admin', isAdmin: true };
    store.setUser(user);
    expect(store.user()).toEqual(user);
    expect(store.isAdmin()).toBeTrue();
  });

  it('isAdmin is false when user is not admin', () => {
    store.setUser({ userId: 2, userName: 'user', isAdmin: false });
    expect(store.isAdmin()).toBeFalse();
  });

  it('logout clears token, user, and localStorage', () => {
    store.setToken('tok');
    store.setUser({ userId: 1, userName: 'u', isAdmin: false });
    store.logout();
    expect(store.token()).toBeNull();
    expect(store.user()).toBeNull();
    expect(store.isAuthenticated()).toBeFalse();
    expect(localStorage.getItem('session-key')).toBeNull();
  });
});
