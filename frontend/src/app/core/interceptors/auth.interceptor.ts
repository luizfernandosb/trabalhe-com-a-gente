import { HttpInterceptorFn } from '@angular/common/http';

import { environment } from '../../../environments/environment';

/**
 * Interceptor de autenticação.
 * Adiciona o header "Authorization: Bearer <token>" em todas as requisições HTTP.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authReq = req.clone({
    headers: req.headers.set('Authorization', `Bearer ${environment.apiToken}`),
  });

  return next(authReq);
};
