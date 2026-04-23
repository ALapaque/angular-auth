import { InjectionToken } from '@angular/core';
import type { Provider as OAuthProvider, SupabaseClientOptions } from '@supabase/supabase-js';

export type SupabaseLoginStrategy =
  | { type: 'password'; email: string; password: string }
  | { type: 'otp'; email: string }
  | {
      type: 'oauth';
      provider: OAuthProvider;
      redirectTo?: string;
      scopes?: string;
    };

export interface SupabaseAdapterConfig {
  url: string;
  anonKey: string;
  /** Forwarded to `createClient()` for advanced SDK configuration. */
  clientOptions?: SupabaseClientOptions<'public'>;
  /** Strategy used when `login()` is called without arguments. */
  defaultStrategy?: SupabaseLoginStrategy;
}

export const SUPABASE_ADAPTER_CONFIG = new InjectionToken<SupabaseAdapterConfig>(
  'SUPABASE_ADAPTER_CONFIG',
);
