import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { MysqlService } from '@keira/shared/db-layer';

/** On a 401 from the API (except the login call itself), drop the web session. */
export const webAuth401Interceptor: HttpInterceptorFn = (req, next) => {
  const mysqlService = inject(MysqlService);
  return next(req).pipe(
    catchError((error: unknown) => {
      if (
        error instanceof HttpErrorResponse &&
        error.status === 401 &&
        req.url.startsWith('/api/') &&
        !req.url.startsWith('/api/auth/login')
      ) {
        mysqlService.disconnectWeb();
      }
      return throwError(() => error);
    }),
  );
};
