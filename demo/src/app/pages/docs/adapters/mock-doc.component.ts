import { Component } from '@angular/core';

import { CodeBlockComponent } from '../code-block.component';

@Component({
  selector: 'app-docs-mock',
  standalone: true,
  imports: [CodeBlockComponent],
  template: `
    <h1>Mock adapter</h1>
    <p class="lede">
      Purely in-memory. For local development without a backend, Storybook,
      Playwright/Cypress E2E and TestBed specs.
    </p>

    <h2>Bootstrap</h2>
    <app-code [code]="bootstrap" />

    <h2>Configuration</h2>
    <table class="params">
      <thead><tr><th>Field</th><th>Type</th><th>Description</th></tr></thead>
      <tbody>
        <tr><td><code>user</code></td><td>AuthUser?</td><td>User returned after a successful login. Default: anonymous <code>mock-user</code>.</td></tr>
        <tr><td><code>startAuthenticated</code></td><td>boolean?</td><td>If true, the adapter is already signed in on boot — useful for bypassing the login screen in dev.</td></tr>
        <tr><td><code>accessToken</code></td><td>string?</td><td>Token returned by <code>getAccessToken()</code>. Default: <code>mock-access-token</code>.</td></tr>
        <tr><td><code>latencyMs</code></td><td>number?</td><td>Artificial delay on every async call. Useful to validate loading states.</td></tr>
      </tbody>
    </table>

    <h2>Usage in tests</h2>
    <app-code [code]="testUsage" />

    <h2>Per-call user override</h2>
    <p>Pass a user via <code>login(&#123; extra: &#123; user &#125; &#125;)</code> to try different profiles without restarting the app:</p>
    <app-code [code]="perCall" />

    <h2>When to use</h2>
    <ul>
      <li>Local development when no auth backend is available.</li>
      <li>Feature tests of components that depend on <code>AuthService</code>.</li>
      <li>Storybook stories showing a logged-in variant of a component.</li>
      <li>End-to-end tests where a real identity provider is overkill.</li>
    </ul>

    <p class="warning">Never ship this adapter to production — every user is a mock user.</p>
  `,
  styles: [
    `
      table.params { width: 100%; border-collapse: collapse; margin: 0.75rem 0; font-size: 0.88rem; }
      .params th, .params td { text-align: left; padding: 0.35rem 0.55rem; border-bottom: 1px solid color-mix(in srgb, currentColor 12%, transparent); vertical-align: top; }
      .params th { font-weight: 600; opacity: 0.75; }
      p.warning { padding: 0.5rem 0.8rem; border-left: 3px solid #c33; background: color-mix(in srgb, #c33 12%, transparent); margin: 1rem 0; border-radius: 0 4px 4px 0; }
    `,
  ],
})
export class DocsMockComponent {
  readonly bootstrap = `import { provideAuth, provideMock } from '@amaurylapaque/angular-auth';

provideAuth(
  provideMock({
    user: { id: 'u-1', name: 'Alice', email: 'alice@test.dev', roles: ['admin'] },
    startAuthenticated: true,
  }),
);`;

  readonly testUsage = `// spec file
TestBed.configureTestingModule({
  providers: [
    { provide: MOCK_ADAPTER_CONFIG, useValue: { user: testUser } },
    MockAuthAdapter,
    { provide: AUTH_PROVIDER, useExisting: MockAuthAdapter },
  ],
});

const adapter = TestBed.inject(MockAuthAdapter);
adapter.setUser({ id: 'u-2' });   // flips state synchronously
adapter.setUser(null);             // signs out`;

  readonly perCall = `await auth.login({
  extra: { user: { id: 'u-99', name: 'Admin Preview', roles: ['admin'] } },
});`;
}
