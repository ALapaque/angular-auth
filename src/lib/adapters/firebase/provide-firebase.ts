import { AUTH_PROVIDER } from '../../core/auth-provider';
import { AuthAdapterFeature } from '../../core/provide-auth';
import {
  FIREBASE_ADAPTER_CONFIG,
  FirebaseAdapterConfig,
} from './firebase-config';
import { FirebaseAuthAdapter } from './firebase.adapter';

export function provideFirebase(config: FirebaseAdapterConfig): AuthAdapterFeature {
  return {
    providers: [
      { provide: FIREBASE_ADAPTER_CONFIG, useValue: config },
      FirebaseAuthAdapter,
      { provide: AUTH_PROVIDER, useExisting: FirebaseAuthAdapter },
    ],
  };
}
