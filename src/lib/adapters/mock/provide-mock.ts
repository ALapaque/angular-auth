import { AUTH_PROVIDER } from '../../core/auth-provider';
import { AuthAdapterFeature } from '../../core/provide-auth';
import { MOCK_ADAPTER_CONFIG, MockAdapterConfig } from './mock-config';
import { MockAuthAdapter } from './mock.adapter';

export function provideMock(config: MockAdapterConfig = {}): AuthAdapterFeature {
  return {
    providers: [
      { provide: MOCK_ADAPTER_CONFIG, useValue: config },
      MockAuthAdapter,
      { provide: AUTH_PROVIDER, useExisting: MockAuthAdapter },
    ],
  };
}
