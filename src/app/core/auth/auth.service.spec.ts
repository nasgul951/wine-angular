import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';
import { AuthStore } from './auth.store';
import { environment } from '../../../environments/environment';

describe('AuthService', () => {
  let service: AuthService;
  let httpTesting: HttpTestingController;
  let store: AuthStore;
  const baseUrl = `${environment.apiBaseUrl}/auth`;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AuthService);
    httpTesting = TestBed.inject(HttpTestingController);
    store = TestBed.inject(AuthStore);
  });

  afterEach(() => {
    httpTesting.verify();
    localStorage.clear();
  });

  describe('login', () => {
    it('POSTs to /auth, calls setToken, and returns true on success', () => {
      spyOn(store, 'setToken');
      service.login({ username: 'u', password: 'p' }).subscribe(result => {
        expect(result).toBeTrue();
      });

      const req = httpTesting.expectOne(baseUrl);
      expect(req.request.method).toBe('POST');
      req.flush({ token: 'jwt-123', expires: new Date() });
      expect(store.setToken).toHaveBeenCalledWith('jwt-123');
    });

    it('returns false and does not call setToken on HTTP error', () => {
      spyOn(store, 'setToken');
      service.login({ username: 'u', password: 'p' }).subscribe(result => {
        expect(result).toBeFalse();
      });

      httpTesting.expectOne(baseUrl).flush(null, { status: 401, statusText: 'Unauthorized' });
      expect(store.setToken).not.toHaveBeenCalled();
    });
  });

  describe('getUserInfo', () => {
    it('GETs /auth/userinfo, calls setUser, and returns SessionInfo on success', () => {
      spyOn(store, 'setUser');
      const response = { userId: 1, userName: 'admin', isAdmin: true };

      service.getUserInfo().subscribe(result => {
        expect(result).toEqual(response);
      });

      const req = httpTesting.expectOne(`${baseUrl}/userinfo`);
      expect(req.request.method).toBe('GET');
      req.flush(response);
      expect(store.setUser).toHaveBeenCalledWith(response);
    });

    it('returns null on HTTP error', () => {
      service.getUserInfo().subscribe(result => {
        expect(result).toBeNull();
      });

      httpTesting.expectOne(`${baseUrl}/userinfo`).flush(null, { status: 500, statusText: 'Error' });
    });
  });

  it('logout delegates to store.logout', () => {
    spyOn(store, 'logout');
    service.logout();
    expect(store.logout).toHaveBeenCalled();
  });
});
