import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './auth.interceptor';
import { AuthStore } from './auth.store';

describe('authInterceptor', () => {
  let http: HttpClient;
  let httpTesting: HttpTestingController;
  let store: AuthStore;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    http = TestBed.inject(HttpClient);
    httpTesting = TestBed.inject(HttpTestingController);
    store = TestBed.inject(AuthStore);
  });

  afterEach(() => {
    httpTesting.verify();
    localStorage.clear();
  });

  it('attaches Authorization header on normal requests', () => {
    store.setToken('my-token');
    http.get('/api/wines').subscribe();

    const req = httpTesting.expectOne('/api/wines');
    expect(req.request.headers.get('Authorization')).toBe('Bearer my-token');
    req.flush([]);
  });

  it('skips header on POST /auth (login endpoint)', () => {
    store.setToken('my-token');
    http.post('http://localhost:5197/auth', {}).subscribe();

    const req = httpTesting.expectOne('http://localhost:5197/auth');
    expect(req.request.headers.has('Authorization')).toBeFalse();
    req.flush({});
  });

  it('skips header when no token exists', () => {
    http.get('/api/wines').subscribe();

    const req = httpTesting.expectOne('/api/wines');
    expect(req.request.headers.has('Authorization')).toBeFalse();
    req.flush([]);
  });
});
