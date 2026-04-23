import { InjectionToken } from '@angular/core';
import { FirebaseOptions } from 'firebase/app';
import { AuthProvider as FirebaseAuthProvider } from 'firebase/auth';

export type FirebaseLoginStrategy =
  | { type: 'email-password'; email: string; password: string }
  | { type: 'popup'; provider: FirebaseAuthProvider }
  | { type: 'redirect'; provider: FirebaseAuthProvider }
  | { type: 'custom'; token: string }
  | { type: 'anonymous' };

export interface FirebaseAdapterConfig {
  firebaseOptions: FirebaseOptions;
  /**
   * Default strategy used when `login()` is called without arguments.
   * Specific calls can still override via `LoginOptions.extra.strategy`.
   */
  defaultStrategy?: FirebaseLoginStrategy;
}

export const FIREBASE_ADAPTER_CONFIG = new InjectionToken<FirebaseAdapterConfig>(
  'FIREBASE_ADAPTER_CONFIG',
);
