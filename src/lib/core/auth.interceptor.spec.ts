import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';

import { MOCK_ADAPTER_CONFIG } from '../adapters/mock/mock-config';
import { MockAuthAdapter } from '../adapters/mock/mock.adapter';
import { AUTH_CORE_CONFIG } from './auth-config';
import { AUTH_PROVIDER } from './auth-provider';
import { authInterceptor } from './auth.interceptor';

function configure(protectedResourceUrls: string[]): void {
  TestBed.configureTestingModule({
    providers: [
      provideHttpClient(withInterceptors([authInterceptor])),
      provideHttpClientTesting(),
      { provide: AUTH_CORE_CONFIG, useValue: { protectedResourceUrls } },
      {
        provide: MOCK_ADAPTER_CONFIG,
        useValue: {
          startAuthenticated: true,
          user: { id: 'u' },
          accessToken: 'ey.mock.token',
        },
      },
      MockAuthAdapter,
      { provide: AUTH_PROVIDER, useExisting: MockAuthAdapter },
    ],
  });
}

// The interceptor reads the token asynchronously (`from(auth.getAccessToken())`),
// so requests fire on the next microtask — tests flush it before assertions.
const flush = () => new Promise((r) => setTimeout(r, 0));

describe('authInterceptor', () => {
  it('attaches Bearer token to matching URLs', async () => {
    configure(['https://api.example.com']);
    const http = TestBed.inject(HttpClient);
    const ctrl = TestBed.inject(HttpTestingController);

    http.get('https://api.example.com/me').subscribe();
    await flush();
    const req = ctrl.expectOne('https://api.example.com/me');
    expect(req.request.headers.get('Authorization')).toBe('Bearer ey.mock.token');
    req.flush({});
  });

  it('leaves non-matching URLs untouched', async () => {
    configure(['https://api.example.com']);
    const http = TestBed.inject(HttpClient);
    const ctrl = TestBed.inject(HttpTestingController);

    http.get('https://third-party.example.org/data').subscribe();
    await flush();
    const req = ctrl.expectOne('https://third-party.example.org/data');
    expect(req.request.headers.get('Authorization')).toBeNull();
    req.flush({});
  });

  it('wildcard "*" attaches the token everywhere', async () => {
    configure(['*']);
    const http = TestBed.inject(HttpClient);
    const ctrl = TestBed.inject(HttpTestingController);

    http.get('https://anywhere.test/x').subscribe();
    await flush();
    const req = ctrl.expectOne('https://anywhere.test/x');
    expect(req.request.headers.get('Authorization')).toBe('Bearer ey.mock.token');
    req.flush({});
  });
});
