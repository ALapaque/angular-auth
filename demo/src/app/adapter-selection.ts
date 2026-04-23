import { AuthAdapterFeature, provideMock } from '@amaurylapaque/angular-auth';

export interface AdapterOption {
  readonly key: string;
  readonly label: string;
  readonly build: () => AuthAdapterFeature;
  readonly note: string;
}

/**
 * Demo-only registry. Real apps typically choose the adapter in
 * bootstrap from a single env value — see the README.
 */
export const ADAPTER_OPTIONS: readonly AdapterOption[] = [
  {
    key: 'mock-admin',
    label: 'Mock — admin user',
    note: 'In-memory provider, user starts anonymous then logs in as admin.',
    build: () =>
      provideMock({
        user: {
          id: 'demo-admin',
          name: 'Demo Admin',
          email: 'admin@example.com',
          roles: ['admin'],
        },
      }),
  },
  {
    key: 'mock-guest',
    label: 'Mock — guest user',
    note: 'Different user shape, demonstrates isolated DI state.',
    build: () =>
      provideMock({
        user: {
          id: 'demo-guest',
          name: 'Guest',
          email: 'guest@example.com',
          roles: ['reader'],
        },
      }),
  },
  {
    key: 'mock-authenticated',
    label: 'Mock — already signed in',
    note: 'startAuthenticated=true; skips the login step.',
    build: () =>
      provideMock({
        startAuthenticated: true,
        user: {
          id: 'demo-admin',
          name: 'Pre-authenticated',
          email: 'pre@example.com',
          roles: ['admin'],
        },
      }),
  },
  {
    key: 'mock-slow',
    label: 'Mock — slow network (1s latency)',
    note: 'Useful to validate loading states in real apps.',
    build: () =>
      provideMock({
        user: { id: 'demo-slow', name: 'Slow User' },
        latencyMs: 1000,
      }),
  },
];

const STORAGE_KEY = 'generic-auth-demo.adapter';
const DEFAULT = ADAPTER_OPTIONS[0].key;

export function getSelectedAdapterKey(): string {
  if (typeof localStorage === 'undefined') return DEFAULT;
  const stored = localStorage.getItem(STORAGE_KEY);
  return ADAPTER_OPTIONS.some((o) => o.key === stored) ? stored! : DEFAULT;
}

export function setSelectedAdapterKey(key: string): void {
  localStorage.setItem(STORAGE_KEY, key);
}

export function getSelectedAdapter(): AdapterOption {
  const key = getSelectedAdapterKey();
  return ADAPTER_OPTIONS.find((o) => o.key === key) ?? ADAPTER_OPTIONS[0];
}
