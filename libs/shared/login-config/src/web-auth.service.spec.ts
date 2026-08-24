import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { WebAuthService } from './web-auth.service';

describe('WebAuthService', () => {
  let service: WebAuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(WebAuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('login posts credentials to /api/auth/login', async () => {
    const result = new Promise((resolve) => service.login('admin', 'pw').subscribe(resolve));
    const req = httpMock.expectOne('/api/auth/login');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ username: 'admin', password: 'pw' });
    req.flush({ success: true });
    expect(await result).toEqual({ success: true });
  });

  it('logout posts to /api/auth/logout', async () => {
    const result = new Promise((resolve) => service.logout().subscribe(resolve));
    const req = httpMock.expectOne('/api/auth/logout');
    expect(req.request.method).toBe('POST');
    req.flush({ success: true });
    expect(await result).toEqual({ success: true });
  });
});
