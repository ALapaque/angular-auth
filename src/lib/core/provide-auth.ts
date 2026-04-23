import {
  APP_INITIALIZER,
  EnvironmentProviders,
  Provider,
  makeEnvironmentProviders,
} from '@angular/core';

import { AUTH_CORE_CONFIG, AuthCoreConfig } from './auth-config';
import { AuthService } from './auth.service';

/**
 * A "feature" returned by provideXxx() adapter helpers. It's just a
 * bag of providers, kept opaque so consumers write:
 *
 *   provideAuth(provideOidc({...}), { protectedResourceUrls: [...] })
 */
export interface AuthAdapterFeature {
  readonly providers: Array<Provider | EnvironmentProviders>;
}

export function provideAuth(
  adapter: AuthAdapterFeature,
  config: AuthCoreConfig = {},
): EnvironmentProviders {
  return makeEnvironmentProviders([
    { provide: AUTH_CORE_CONFIG, useValue: config },
    ...adapter.providers,
    {
      provide: APP_INITIALIZER,
      multi: true,
      useFactory: (auth: AuthService) => () => auth.init(),
      deps: [AuthService],
    },
  ]);
}
