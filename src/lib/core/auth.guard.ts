import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { filter, take } from 'rxjs/operators';

import { AUTH_CORE_CONFIG } from './auth-config';
import { AuthService } from './auth.service';

/**
 * Functional route guard. Waits for the provider to finish bootstrapping,
 * then either lets the navigation through or triggers a login.
 */
export const authGuard: CanActivateFn = async (_route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const config = inject(AUTH_CORE_CONFIG);

  await auth.init();

  const authed = await firstValueFrom(
    auth.isAuthenticated$.pipe(
      filter((value) => value !== null && value !== undefined),
      take(1),
    ),
  );

  if (authed) {
    return true;
  }

  if (config.loginRedirectUrl) {
    return router.parseUrl(config.loginRedirectUrl);
  }

  await auth.login({ redirectUrl: state.url });
  return false;
};
