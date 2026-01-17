import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { catchError, switchMap, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  // Não adiciona token em requisições de login
  if (req.url.includes('/autenticacao/login')) {
    return next(req);
  }

  // Clona a requisição adicionando o token
  const authReq = token
    ? req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      })
    : req;

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Se retornar 401 e não for a rota de refresh, tenta renovar o token
      if (error.status === 401 && !req.url.includes('/autenticacao/refresh')) {
        return authService.refreshToken().pipe(
          switchMap(() => {
            // Refaz a requisição com o novo token
            const newToken = authService.getToken();
            const retryReq = req.clone({
              setHeaders: {
                Authorization: `Bearer ${newToken}`
              }
            });
            return next(retryReq);
          }),
          catchError(refreshError => {
            // Se falhar ao renovar, desloga o usuário
            authService.logout();
            return throwError(() => refreshError);
          })
        );
      }

      return throwError(() => error);
    })
  );
};