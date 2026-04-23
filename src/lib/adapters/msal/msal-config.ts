import { InjectionToken } from '@angular/core';

export interface MsalAdapterConfig {
  /** Default scopes used for login and silent token acquisition. */
  scopes?: string[];
  /** Redirect is the safest default across browsers; popup is nicer for SPA UX. */
  interactionType?: 'redirect' | 'popup';
}

export const MSAL_ADAPTER_CONFIG = new InjectionToken<MsalAdapterConfig>('MSAL_ADAPTER_CONFIG');
