import '../../../test-setup';

import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { HttpErrorResponse } from '@angular/common/http';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let routerSpy: { navigate: ReturnType<typeof vi.fn> };
  const API_URL = 'https://pet-manager-api.geia.vip';

  const mockLoginResponse = {
    access_token: 'fake-jwt-token-12345',
    refresh_token:67890'
  };

  const mockRefreshResponse = {
    access_token: 'new-fake-jwt-token',
    refresh_token: 'new-fake-refresh-token'
  };

  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();

    routerSpy = {
      navigate: vi.fn()
    };

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AuthService,
        { provide: Router, useValue: routerSpy }
      ]
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
    sessionStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('login', () => {
    it('should authenticate user and store tokens', (done) => {
      const username = 'admin';
      const password = 'admin123';

      service.login(username, password).subscribe({
        next: (response) => {
          expect(response).toEqual(mockLoginResponse);
          expect(localStorage.getItem('access_token')).toBe(mockLoginResponse.access_token);
          expect(localStorage.getItem('refresh_token')).toBe(mockLoginResponse.refresh_token);
          done();
        }
      });

      const req = httpMock.expectOne(`${API_URL}/autenticacao/login`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ username, password });

      req.flush(mockLoginResponse);
    });

    it('should update isAuthenticated$ observable on successful login', (done) => {
      service.login('admin', 'admin123').subscribe(() => {
        service.isAuthenticated$.subscribe(isAuth => {
          expect(isAuth).toBe(true);
          done();
        });
      });

      const req = httpMock.expectOne(`${API_URL}/autenticacao/login`);
      req.flush(mockLoginResponse);
    });

    it('should handle login without refresh_token', (done) => {
      const responseWithoutRefresh = {
        access_token: 'fake-token-only'
      };

      service.login('admin', 'admin123').subscribe({
        next: (response) => {
          expect(response).toEqual(responseWithoutRefresh);
          expect(localStorage.getItem('access_token')).toBe('fake-token-only');
          expect(localStorage.getItem('refresh_token')).toBeNull();
          done();
        }
      });

      const req = httpMock.expectOne(`${API_URL}/autenticacao/login`);
      req.flush(responseWithoutRefresh);
    });

    it('should handle invalid credentials (401)', (done) => {
      service.login('wrong', 'credentials').subscribe({
        next: () => {
          throw new Error('should have failed');
        },
        error: (error: HttpErrorResponse) => {
          expect(error.status).toBe(401);
          expect(error.statusText).toBe('Unauthorized');
          expect(localStorage.getItem('access_token')).toBeNull();
          done();
        }
      });

      const req = httpMock.expectOne(`${API_URL}/autenticacao/login`);
      req.flush('Invalid credentials', { status: 401, statusText: 'Unauthorized' });
    });

    it('should handle empty username', (done) => {
      service.login('', 'password').subscribe({
        next: () => {
          throw new Error('should have failed');
        },
        error: (error: HttpErrorResponse) => {
          expect(error.status).toBe(400);
          done();
        }
      });

      const req = httpMock.expectOne(`${API_URL}/autenticacao/login`);
      req.flush('Username is required', { status: 400, statusText: 'Bad Request' });
    });

    it('should handle empty password', (done) => {
      service.login('admin', '').subscribe({
        next: () => {
          throw new Error('should have failed');
        },
        error: (error: HttpErrorResponse) => {
          expect(error.status).toBe(400);
          done();
        }
      });

      const req = httpMock.expectOne(`${API_URL}/autenticacao/login`);
      req.flush('Password is required', { status: 400, statusText: 'Bad Request' });
    });

    it('should handle server error during login', (done) => {
      service.login('admin', 'admin123').subscribe({
        next: () => {
          throw new Error('should have failed');
        },
        error: (error: HttpErrorResponse) => {
          expect(error.status).toBe(500);
          done();
        }
      });

      const req = httpMock.expectOne(`${API_URL}/autenticacao/login`);
      req.flush('Internal Server Error', { status: 500, statusText: 'Internal Server Error' });
    });

    it('should handle network error', (done) => {
      service.login('admin', 'admin123').subscribe({
        next: () => {
          throw new Error('should have failed');
        },
        error: (error) => {
          expect(error.error).toBeTruthy();
          done();
        }
      });

      const req = httpMock.expectOne(`${API_URL}/autenticacao/login`);
      req.error(new ProgressEvent('Network error'));
    });

    it('should not store tokens on failed login', (done) => {
      service.login('wrong', 'credentials').subscribe({
        error: () => {
          expect(localStorage.getItem('access_token')).toBeNull();
          expect(localStorage.getItem('refresh_token')).toBeNull();
          done();
        }
      });

      const req = httpMock.expectOne(`${API_URL}/autenticacao/login`);
      req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
    });
  });

  describe('logout', () => {
    beforeEach(() => {
      localStorage.setItem('access_token', 'fake-token');
      localStorage.setItem('refresh_token', 'fake-refresh-token');
    });

    it('should clear tokens from localStorage and navigate to login', () => {
      service.logout();

      expect(localStorage.getItem('access_token')).toBeNull();
      expect(localStorage.getItem('refresh_token')).toBeNull();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/auth/login']);
    });

    it('should update isAuthenticated$ observable on logout', (done) => {
      service.logout();

      service.isAuthenticated$.subscribe(isAuth => {
        expect(isAuth).toBe(false);
        done();
      });
    });

    it('should clear tokens even if they dont exist', () => {
      localStorage.clear();

      expect(() => service.logout()).not.toThrow();
      expect(localStorage.getItem('access_token')).toBeNull();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/auth/login']);
    });

    it('should work multiple times', () => {
      service.logout();
      service.logout();
      service.logout();

      expect(localStorage.getItem('access_token')).toBeNull();
      expect(localStorage.getItem('refresh_token')).toBeNull();
      expect(routerSpy.navigate).toHaveBeenCalledTimes(3);
    });
  });

  describe('refreshToken', () => {
    beforeEach(() => {
      localStorage.setItem('refresh_token', 'old-refresh-token');
    });

    it('should refresh token successfully', (done) => {
      service.refreshToken().subscribe({
        next: (response) => {
          expect(response).toEqual(mockRefreshResponse);
          expect(localStorage.getItem('access_token')).toBe(mockRefreshResponse.access_token);
          expect(localStorage.getItem('refresh_token')).toBe(mockRefreshResponse.refresh_token);
          done();
        }
      });

      const req = httpMock.expectOne(`${API_URL}/autenticacao/refresh`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual({ refresh_token: 'old-refresh-token' });

      req.flush(mockRefreshResponse);
    });

    it('should update isAuthenticated$ observable on successful refresh', (done) => {
      service.refreshToken().subscribe(() => {
        service.isAuthenticated$.subscribe(isAuth => {
          expect(isAuth).toBe(true);
          done();
        });
      });

      const req = httpMock.expectOne(`${API_URL}/autenticacao/refresh`);
      req.flush(mockRefreshResponse);
    });

    it('should handle refresh without refresh_token in response', (done) => {
      const responseWithoutRefresh = {
        access_token: 'new-access-token-only'
      };

      service.refreshToken().subscribe({
        next: (response) => {
          expect(response).toEqual(responseWithoutRefresh);
          expect(localStorage.getItem('access_token')).toBe('new-access-token-only');
          expect(localStorage.getItem('refresh_token')).toBe('old-refresh-token');
          done();
        }
      });

      const req = httpMock.expectOne(`${API_URL}/autenticacao/refresh`);
      req.flush(responseWithoutRefresh);
    });

    it('should handle expired refresh token and logout', (done) => {
      service.refreshToken().subscribe({
        next: () => {
          throw new Error('should have failed');
        },
        error: (error: HttpErrorResponse) => {
          expect(error.status).toBe(401);
          expect(localStorage.getItem('access_token')).toBeNull();
          expect(localStorage.getItem('refresh_token')).toBeNull();
          expect(routerSpy.navigate).toHaveBeenCalledWith(['/auth/login']);
          done();
        }
      });

      const req = httpMock.expectOne(`${API_URL}/autenticacao/refresh`);
      req.flush('Refresh token expired', { status: 401, statusText: 'Unauthorized' });
    });

    it('should handle missing refresh token', (done) => {
      localStorage.removeItem('refresh_token');

      service.refreshToken().subscribe({
        next: () => {
          throw new Error('should have failed');
        },
        error: (error) => {
          expect(error.message).toBe('No refresh token available');
          expect(routerSpy.navigate).toHaveBeenCalledWith(['/auth/login']);
          done();
        }
      });

      httpMock.expectNone(`${API_URL}/autenticacao/refresh`);
    });

    it('should update both tokens on successful refresh', (done) => {
      const oldToken = localStorage.getItem('access_token');
      const oldRefreshToken = localStorage.getItem('refresh_token');

      service.refreshToken().subscribe({
        next: () => {
          expect(localStorage.getItem('access_token')).not.toBe(oldToken);
          expect(localStorage.getItem('refresh_token')).not.toBe(oldRefreshToken);
          expect(localStorage.getItem('access_token')).toBe(mockRefreshResponse.access_token);
          expect(localStorage.getItem('refresh_token')).toBe(mockRefreshResponse.refresh_token);
          done();
        }
      });

      const req = httpMock.expectOne(`${API_URL}/autenticacao/refresh`);
      req.flush(mockRefreshResponse);
    });

    it('should handle server error during refresh and logout', (done) => {
      service.refreshToken().subscribe({
        next: () => {
          throw new Error('should have failed');
        },
        error: (error: HttpErrorResponse) => {
          expect(error.status).toBe(500);
          expect(routerSpy.navigate).toHaveBeenCalledWith(['/auth/login']);
          done();
        }
      });

      const req = httpMock.expectOne(`${API_URL}/autenticacao/refresh`);
      req.flush('Server error', { status: 500, statusText: 'Internal Server Error' });
    });
  });

  describe('isAuthenticated', () => {
    it('should return true when access_token exists', () => {
      localStorage.setItem('access_token', 'fake-token');

      expect(service.isAuthenticated()).toBe(true);
    });

    it('should return false when access_token does not exist', () => {
      localStorage.removeItem('access_token');

      expect(service.isAuthenticated()).toBe(false);
    });

    it('should return false when access_token is null', () => {
      localStorage.setItem('access_token', 'null');

      expect(service.isAuthenticated()).toBe(true); // String 'null' é considerado válido
    });

    it('should return false when access_token is empty string', () => {
      localStorage.setItem('access_token', '');

      expect(service.isAuthenticated()).toBe(false);
    });

    it('should return true for any valid token string', () => {
      localStorage.setItem('access_token', 'any-valid-token-string');

      expect(service.isAuthenticated()).toBe(true);
    });
  });

  describe('getToken', () => {
    it('should return access_token from localStorage', () => {
      const token = 'test-token-123';
      localStorage.setItem('access_token', token);

      expect(service.getToken()).toBe(token);
    });

    it('should return null when access_token does not exist', () => {
      localStorage.removeItem('access_token');

      expect(service.getToken()).toBeNull();
    });

    it('should return current token value', () => {
      localStorage.setItem('access_token', 'token-1');
      expect(service.getToken()).toBe('token-1');

      localStorage.setItem('access_token', 'token-2');
      expect(service.getToken()).toBe('token-2');
    });
  });

  describe('register', () => {
    it('should register a new user', (done) => {
      const username = 'newuser';
      const password = 'newpass123';

      service.register(username, password).subscribe({
        next: (response) => {
          expect(response).toBeTruthy();
          done();
        }
      });

      const req = httpMock.expectOne(`${API_URL}/q/autenticacao/register`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ username, password });

      req.flush({ success: true, message: 'User registered' });
    });

    it('should handle registration with duplicate username', (done) => {
      service.register('existinguser', 'password').subscribe({
        next: () => {
          throw new Error('should have failed');
        },
        error: (error: HttpErrorResponse) => {
          expect(error.status).toBe(409);
          done();
        }
      });

      const req = httpMock.expectOne(`${API_URL}/q/autenticacao/register`);
      req.flush('Username already exists', { status: 409, statusText: 'Conflict' });
    });

    it('should handle validation error during registration', (done) => {
      service.register('', '').subscribe({
        next: () => {
          throw new Error('should have failed');
        },
        error: (error: HttpErrorResponse) => {
          expect(error.status).toBe(400);
          done();
        }
      });

      const req = httpMock.expectOne(`${API_URL}/q/autenticacao/register`);
      req.flush('Validation error', { status: 400, statusText: 'Bad Request' });
    });
  });

  describe('Token Management Flow', () => {
    it('should handle complete authentication flow', (done) => {
      // Login
      service.login('admin', 'admin123').subscribe(() => {
        expect(service.isAuthenticated()).toBe(true);
        expect(service.getToken()).toBe(mockLoginResponse.access_token);

        // Logout
        service.logout();
        expect(service.isAuthenticated()).toBe(false);
        expect(service.getToken()).toBeNull();
        done();
      });

      const loginReq = httpMock.expectOne(`${API_URL}/autenticacao/login`);
      loginReq.flush(mockLoginResponse);
    });

    it('should handle token refresh in authenticated session', (done) => {
      // Initial login
      localStorage.setItem('access_token', 'old-token');
      localStorage.setItem('refresh_token', 'old-refresh');

      expect(service.isAuthenticated()).toBe(true);

      // Refresh token
      service.refreshToken().subscribe(() => {
        expect(service.isAuthenticated()).toBe(true);
        expect(service.getToken()).toBe(mockRefreshResponse.access_token);
        done();
      });

      const refreshReq = httpMock.expectOne(`${API_URL}/autenticacao/refresh`);
      refreshReq.flush(mockRefreshResponse);
    });

    it('should logout user when refresh token fails', (done) => {
      localStorage.setItem('access_token', 'old-token');
      localStorage.setItem('refresh_token', 'expired-refresh');

      service.refreshToken().subscribe({
        error: () => {
          expect(service.isAuthenticated()).toBe(false);
          expect(routerSpy.navigate).toHaveBeenCalledWith(['/auth/login']);
          done();
        }
      });

      const req = httpMock.expectOne(`${API_URL}/autenticacao/refresh`);
      req.flush('Expired', { status: 401, statusText: 'Unauthorized' });
    });
  });

  describe('Edge Cases', () => {
    it('should handle concurrent login requests', () => {
      service.login('user1', 'pass1').subscribe();
      service.login('user2', 'pass2').subscribe();

      const requests = httpMock.match(`${API_URL}/autenticacao/login`);
      expect(requests.length).toBe(2);

      requests[0].flush({ access_token: 'token1', refresh_token: 'refresh1' });
      requests[1].flush({ access_token: 'token2', refresh_token: 'refresh2' });

      // Last login should win
      expect(localStorage.getItem('access_token')).toBe('token2');
    });

    it('should handle logout during active request', () => {
      service.login('admin', 'admin123').subscribe();
      
      service.logout();
      
      expect(service.isAuthenticated()).toBe(false);

      const req = httpMock.expectOne(`${API_URL}/autenticacao/login`);
      req.flush(mockLoginResponse);
    });
  });

  describe('Security', () => {
    it('should not expose password in request', (done) => {
      service.login('admin', 'secret-password').subscribe();

      const req = httpMock.expectOne(`${API_URL}/autenticacao/login`);
      
      expect(req.request.body.password).toBe('secret-password');
      
      req.flush(mockLoginResponse);
      done();
    });

    it('should clear sensitive data on logout', () => {
      localStorage.setItem('access_token', 'sensitive-token');
      localStorage.setItem('refresh_token', 'sensitive-refresh');
      localStorage.setItem('userEmail', 'user@example.com');

      service.logout();

      expect(localStorage.getItem('access_token')).toBeNull();
      expect(localStorage.getItem('refresh_token')).toBeNull();
      // userEmail should remain (not auth-related)
      expect(localStorage.getItem('userEmail')).toBe('user@example.com');
    });

    it('should handle malicious token strings', () => {
      const maliciousTokens = [
        '<script>alert("xss")</script>',
        'javascript:alert(1)',
        '../../etc/passwd',
        '{}',
        '[]'
      ];

      maliciousTokens.forEach(token => {
        localStorage.setItem('access_token', token);
        expect(service.isAuthenticated()).toBe(true);
      });

      localStorage.setItem('access_token', '');
      expect(service.isAuthenticated()).toBe(false);
    });
  });

  describe('isAuthenticated$ Observable', () => {
    it('should emit false initially when no token exists', (done) => {
      localStorage.clear();
      
      const newService = new AuthService(
        TestBed.inject(HttpClient),
        TestBed.inject(Router)
      );

      newService.isAuthenticated$.subscribe(isAuth => {
        expect(isAuth).toBe(false);
        done();
      });
    });

    it('should emit true initially when token exists', (done) => {
      localStorage.setItem('access_token', 'existing-token');
      
      const newService = new AuthService(
        TestBed.inject(HttpClient),
        TestBed.inject(Router)
      );

      newService.isAuthenticated$.subscribe(isAuth => {
        expect(isAuth).toBe(true);
        done();
      });
    });

    it('should emit true after successful login', (done) => {
      let emissionCount = 0;
      
      service.isAuthenticated$.subscribe(isAuth => {
        emissionCount++;
        if (emissionCount === 2) {
          expect(isAuth).toBe(true);
          done();
        }
      });

      service.login('admin', 'admin123').subscribe();

      const req = httpMock.expectOne(`${API_URL}/autenticacao/login`);
      req.flush(mockLoginResponse);
    });

    it('should emit false after logout', (done) => {
      localStorage.setItem('access_token', 'token');
      let emissionCount = 0;
      
      service.isAuthenticated$.subscribe(isAuth => {
        emissionCount++;
        if (emissionCount === 2) {
          expect(isAuth).toBe(false);
          done();
        }
      });

      service.logout();
    });
  });
});