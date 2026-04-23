import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { from, switchMap } from 'rxjs';

import { AUTH_CORE_CONFIG } from './auth-config';
import { AuthService } from './auth.service';

/**
 * Attaches `Authorization: Bearer <token>` to outgoing requests whose
 * URL matches `protectedResourceUrls` from AuthCoreConfig.
 * Register it via: `provideHttpClient(withInterceptors([authInterceptor]))`.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const { protectedResourceUrls = [] } = inject(AUTH_CORE_CONFIG);

  const matches =
    protectedResourceUrls.includes('*') ||
    protectedResourceUrls.some((url) => req.url.startsWith(url));

  if (!matches) {
    return next(req);
  }

  return from(auth.getAccessToken()).pipe(
    switchMap((token) => {
      const authed = token
        ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
        : req;
      return next(authed);
    }),
  );
};
