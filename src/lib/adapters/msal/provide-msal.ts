import {
  MSAL_INSTANCE,
  MsalBroadcastService,
  MsalService,
} from '@azure/msal-angular';
import { IPublicClientApplication, PublicClientApplication } from '@azure/msal-browser';

import { AUTH_PROVIDER } from '../../core/auth-provider';
import { AuthAdapterFeature } from '../../core/provide-auth';
import { MSAL_ADAPTER_CONFIG, MsalAdapterConfig } from './msal-config';
import { MsalAuthAdapter } from './msal.adapter';

export interface MsalProviderConfig extends MsalAdapterConfig {
  clientId: string;
  /** Tenant id or `common` / `organizations` / `consumers`. */
  authority: string;
  redirectUri: string;
  postLogoutRedirectUri?: string;
  /** Pre-built MSAL client for advanced scenarios. If provided, other fields are ignored. */
  instance?: IPublicClientApplication;
}

export function provideMsal(config: MsalProviderConfig): AuthAdapterFeature {
  const instanceFactory = (): IPublicClientApplication =>
    config.instance ??
    new PublicClientApplication({
      auth: {
        clientId: config.clientId,
        authority: config.authority,
        redirectUri: config.redirectUri,
        postLogoutRedirectUri: config.postLogoutRedirectUri ?? config.redirectUri,
      },
      cache: {
        cacheLocation: 'localStorage',
      },
    });

  return {
    providers: [
      { provide: MSAL_INSTANCE, useFactory: instanceFactory },
      MsalService,
      MsalBroadcastService,
      {
        provide: MSAL_ADAPTER_CONFIG,
        useValue: {
          scopes: config.scopes,
          interactionType: config.interactionType ?? 'redirect',
        } satisfies MsalAdapterConfig,
      },
      MsalAuthAdapter,
      { provide: AUTH_PROVIDER, useExisting: MsalAuthAdapter },
    ],
  };
}
