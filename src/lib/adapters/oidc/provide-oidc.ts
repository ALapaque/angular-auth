import { OpenIdConfiguration, provideAuth as provideOidcClient } from 'angular-auth-oidc-client';

import { AUTH_PROVIDER } from '../../core/auth-provider';
import { AuthAdapterFeature } from '../../core/provide-auth';
import { OidcAuthAdapter } from './oidc.adapter';

export interface OidcProviderConfig {
  /** Issuer URL. E.g. `https://tenant.auth0.com`, `https://keycloak/realms/foo`. */
  authority: string;
  clientId: string;
  redirectUrl: string;
  postLogoutRedirectUri?: string;
  scope?: string;
  responseType?: string;
  /** Escape hatch for any other field of `OpenIdConfiguration`. */
  extra?: Partial<OpenIdConfiguration>;
}

export function provideOidc(config: OidcProviderConfig): AuthAdapterFeature {
  const oidcConfig: OpenIdConfiguration = {
    authority: config.authority,
    redirectUrl: config.redirectUrl,
    postLogoutRedirectUri: config.postLogoutRedirectUri ?? config.redirectUrl,
    clientId: config.clientId,
    scope: config.scope ?? 'openid profile email',
    responseType: config.responseType ?? 'code',
    silentRenew: true,
    useRefreshToken: true,
    renewTimeBeforeTokenExpiresInSeconds: 30,
    ...config.extra,
  };

  return {
    providers: [
      provideOidcClient({ config: oidcConfig }),
      OidcAuthAdapter,
      { provide: AUTH_PROVIDER, useExisting: OidcAuthAdapter },
    ],
  };
}
