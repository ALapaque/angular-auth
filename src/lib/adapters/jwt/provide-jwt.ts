import { AUTH_PROVIDER } from '../../core/auth-provider';
import { AuthAdapterFeature } from '../../core/provide-auth';
import { JWT_ADAPTER_CONFIG, JwtAdapterConfig } from './jwt-config';
import { JwtAuthAdapter } from './jwt.adapter';

export function provideJwt(config: JwtAdapterConfig): AuthAdapterFeature {
  return {
    providers: [
      { provide: JWT_ADAPTER_CONFIG, useValue: config },
      JwtAuthAdapter,
      { provide: AUTH_PROVIDER, useExisting: JwtAuthAdapter },
    ],
  };
}
