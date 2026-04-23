import { Component } from '@angular/core';

import { CodeBlockComponent } from './code-block.component';

@Component({
  selector: 'app-docs-custom-adapter',
  standalone: true,
  imports: [CodeBlockComponent],
  template: `
    <h1>Writing your own adapter</h1>
    <p class="lede">
      Three files: a typed config with an <code>InjectionToken</code>, an
      <code>&#64;Injectable</code> class implementing
      <code>AuthProvider</code>, and a <code>provideXxx()</code> helper.
    </p>

    <h2>1. Config</h2>
    <app-code [code]="config" />

    <h2>2. Adapter</h2>
    <app-code [code]="adapter" />

    <h2>3. provideXxx()</h2>
    <app-code [code]="provide" />

    <h2>Contract checklist</h2>
    <p>Every adapter must satisfy these invariants:</p>
    <ul class="checklist">
      <li><strong><code>init()</code> is idempotent.</strong> Multiple calls must not trigger side effects after the first.</li>
      <li><strong>Reactive streams emit their current value on subscribe.</strong> Use <code>BehaviorSubject</code> or equivalent.</li>
      <li><strong><code>isAuthenticated$</code> never emits <code>undefined</code>.</strong> Before first resolution, emit <code>false</code>.</li>
      <li><strong><code>getAccessToken()</code> returns <code>null</code>, never throws.</strong> No session, expired session, refresh failure — all return <code>null</code>.</li>
      <li><strong><code>AuthUser.id</code> is stable.</strong> Not a display name or email if the SDK exposes a persistent id.</li>
      <li><strong>Preserve raw claims.</strong> Put the original payload in <code>AuthUser.raw</code> so callers can read provider-specific fields.</li>
      <li><strong><code>logout()</code> clears state synchronously.</strong> Update the user stream before awaiting the network call.</li>
    </ul>

    <h2>Testing</h2>
    <p>
      Place the spec next to the adapter and mock the SDK at the DI boundary.
      Aim for: init hydration, each login pathway, logout, access token with
      and without force refresh, and a "no session" edge case.
    </p>
    <app-code [code]="testSkeleton" />

    <h2>Publishing</h2>
    <p>
      If you plan to contribute the adapter upstream, see
      <code>docs/CONTRIBUTING.md</code> in the repo for the style guide,
      adapter folder convention and PR checklist.
    </p>
  `,
  styles: [
    `
      .lede { font-size: 1.05rem; opacity: 0.85; }
      ul.checklist { padding-left: 1.2rem; }
      ul.checklist li { margin: 0.35rem 0; }
    `,
  ],
})
export class DocsCustomAdapterComponent {
  readonly config = `// my-adapter-config.ts
import { InjectionToken } from '@angular/core';

export interface MyAdapterConfig {
  endpoint: string;
  apiKey: string;
}

export const MY_ADAPTER_CONFIG = new InjectionToken<MyAdapterConfig>('MY_ADAPTER_CONFIG');`;

  readonly adapter = `// my.adapter.ts
import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, map } from 'rxjs';
import {
  AuthProvider,
  AuthUser,
  LoginOptions,
  LogoutOptions,
  TokenOptions,
} from '@amaurylapaque/angular-auth';

import { MY_ADAPTER_CONFIG } from './my-adapter-config';

@Injectable()
export class MyAuthAdapter implements AuthProvider {
  private readonly config = inject(MY_ADAPTER_CONFIG);

  private readonly user_ = new BehaviorSubject<AuthUser | null>(null);
  private readonly loading_ = new BehaviorSubject<boolean>(true);

  readonly user$ = this.user_.asObservable();
  readonly isAuthenticated$ = this.user_.pipe(map((u) => u !== null));
  readonly isLoading$ = this.loading_.asObservable();

  private initPromise?: Promise<void>;

  init(): Promise<void> {
    return this.initPromise ??= (async () => {
      // 1. Hydrate from persistent storage / session cookie
      // 2. Handle any redirect callback
      // 3. Seed user_ / loading_
      this.loading_.next(false);
    })();
  }

  async login(_options?: LoginOptions): Promise<void> {
    // Call the SDK, update user_
  }

  async logout(_options?: LogoutOptions): Promise<void> {
    // Clear state synchronously first
    this.user_.next(null);
    // Then await any server-side logout call
  }

  async getAccessToken(_options?: TokenOptions): Promise<string | null> {
    // Return null if not authenticated or refresh fails — never throw
    return null;
  }
}`;

  readonly provide = `// provide-my-adapter.ts
import {
  AUTH_PROVIDER,
  AuthAdapterFeature,
} from '@amaurylapaque/angular-auth';

import { MY_ADAPTER_CONFIG, MyAdapterConfig } from './my-adapter-config';
import { MyAuthAdapter } from './my.adapter';

export function provideMyAdapter(config: MyAdapterConfig): AuthAdapterFeature {
  return {
    providers: [
      { provide: MY_ADAPTER_CONFIG, useValue: config },
      MyAuthAdapter,
      { provide: AUTH_PROVIDER, useExisting: MyAuthAdapter },
    ],
  };
}

// usage:
// provideAuth(provideMyAdapter({ endpoint: '...', apiKey: '...' }))`;

  readonly testSkeleton = `import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { MY_ADAPTER_CONFIG } from './my-adapter-config';
import { MyAuthAdapter } from './my.adapter';

describe('MyAuthAdapter', () => {
  it('starts unauthenticated and resolves init()', async () => {
    TestBed.configureTestingModule({
      providers: [
        { provide: MY_ADAPTER_CONFIG, useValue: { endpoint: '...', apiKey: '...' } },
        MyAuthAdapter,
      ],
    });
    const adapter = TestBed.inject(MyAuthAdapter);
    await adapter.init();
    expect(await firstValueFrom(adapter.isAuthenticated$)).toBe(false);
  });

  it('is idempotent on repeated init()', async () => {
    // ...
  });
});`;
}
