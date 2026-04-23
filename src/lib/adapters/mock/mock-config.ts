import { InjectionToken } from '@angular/core';

import { AuthUser } from '../../core/auth-user';

export interface MockAdapterConfig {
  /** When true, the adapter starts already signed in as `user`. */
  startAuthenticated?: boolean;
  /** The user returned after login / during an auto-authenticated session. */
  user?: AuthUser;
  /** Token handed out by `getAccessToken()`. Defaults to a short dev-only JWT-looking string. */
  accessToken?: string;
  /** Artificial latency to mimic real network calls during E2E tests. */
  latencyMs?: number;
}

export const MOCK_ADAPTER_CONFIG = new InjectionToken<MockAdapterConfig>('MOCK_ADAPTER_CONFIG');
