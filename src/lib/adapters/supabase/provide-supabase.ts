import { AUTH_PROVIDER } from '../../core/auth-provider';
import { AuthAdapterFeature } from '../../core/provide-auth';
import {
  SUPABASE_ADAPTER_CONFIG,
  SupabaseAdapterConfig,
} from './supabase-config';
import { SupabaseAuthAdapter } from './supabase.adapter';

export function provideSupabase(config: SupabaseAdapterConfig): AuthAdapterFeature {
  return {
    providers: [
      { provide: SUPABASE_ADAPTER_CONFIG, useValue: config },
      SupabaseAuthAdapter,
      { provide: AUTH_PROVIDER, useExisting: SupabaseAuthAdapter },
    ],
  };
}
