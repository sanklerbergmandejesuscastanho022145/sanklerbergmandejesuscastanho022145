import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

interface LoginResponse {
  access_token: string;
  refresh_token?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = 'https://pet-manager-api.geia.vip';
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasToken());
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  private hasToken(): boolean {
    return !!localStorage.getItem('access_token');
  }

  isAuthenticated(): boolean {
    return this.hasToken();
  }

  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  login(username: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(
      `${this.API_URL}/autenticacao/login`,
      { username, password }
    ).pipe(
      tap(response => {
        localStorage.setItem('access_token', response.access_token);
        this.isAuthenticatedSubject.next(true);
  }));
  }

  refreshToken(): Observable<LoginResponse> {
    const refreshToken = localStorage.getItem('refresh_token');
    
    if (!refreshToken) {
      this.logout();
      return throwError(() => new Error('No refresh token available'));
    }

    return this.http.post<LoginResponse>(
      `${this.API_URL}/autenticacao/refresh`,
      { refresh_token: refreshToken }
    ).pipe(
      tap(response => {
        localStorage.setItem('access_token', response.access_token);
        if (response.refresh_token) {
          localStorage.setItem('refresh_token', response.refresh_token);
        }
        this.isAuthenticatedSubject.next(true);
      }),
      catchError(error => {
        console.error('Erro ao renovar token:', error);
        this.logout();
        return throwError(() => error);
      })
    );
  }

  logout(): void {
  localStorage.removeItem('access_token');
  this.isAuthenticatedSubject.next(false);
  this.router.navigate(['/auth/login']);
}

  register(username: string, password: string): Observable<any> {
    return this.http.post(`${this.API_URL}/q/autenticacao/register`, {
      username,
      password
    });
  }
}