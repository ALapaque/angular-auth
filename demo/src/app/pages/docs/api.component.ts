import { Component } from '@angular/core';

import { CodeBlockComponent } from './code-block.component';

@Component({
  selector: 'app-docs-api',
  standalone: true,
  imports: [CodeBlockComponent],
  template: `
    <h1>API reference</h1>
    <p class="lede">
      Public types and helpers exported from <code>generic-angular-auth</code>.
    </p>

    <h2><code>AuthService</code></h2>
    <p>The façade every component injects. Provided in root.</p>
    <app-code [code]="authServiceApi" />

    <h2><code>AuthProvider</code></h2>
    <p>Contract every adapter implements. You only touch it when writing a custom adapter.</p>
    <app-code [code]="authProviderApi" />

    <h2><code>AuthUser</code></h2>
    <app-code [code]="authUserApi" />

    <h2>Option types</h2>
    <app-code [code]="optionTypes" />

    <h2><code>AuthCoreConfig</code></h2>
    <app-code [code]="coreConfig" />

    <h2>Helpers</h2>
    <table class="params">
      <thead><tr><th>Symbol</th><th>Kind</th><th>Use</th></tr></thead>
      <tbody>
        <tr><td><code>provideAuth(feature, config?)</code></td><td>function</td><td>Composition root. Registers adapter + APP_INITIALIZER.</td></tr>
        <tr><td><code>authGuard</code></td><td><code>CanActivateFn</code></td><td>Functional route guard.</td></tr>
        <tr><td><code>authInterceptor</code></td><td><code>HttpInterceptorFn</code></td><td>Attaches Bearer tokens to matching requests.</td></tr>
        <tr><td><code>AUTH_PROVIDER</code></td><td>InjectionToken</td><td>DI token every adapter registers itself under.</td></tr>
        <tr><td><code>AUTH_CORE_CONFIG</code></td><td>InjectionToken</td><td>Where <code>AuthCoreConfig</code> is stored.</td></tr>
      </tbody>
    </table>

    <h2>Adapter helpers</h2>
    <table class="params">
      <thead><tr><th>Helper</th><th>Config type</th></tr></thead>
      <tbody>
        <tr><td><code>provideOidc(config)</code></td><td><code>OidcProviderConfig</code></td></tr>
        <tr><td><code>provideMsal(config)</code></td><td><code>MsalProviderConfig</code></td></tr>
        <tr><td><code>provideFirebase(config)</code></td><td><code>FirebaseAdapterConfig</code></td></tr>
        <tr><td><code>provideSupabase(config)</code></td><td><code>SupabaseAdapterConfig</code></td></tr>
        <tr><td><code>provideJwt(config)</code></td><td><code>JwtAdapterConfig</code></td></tr>
        <tr><td><code>provideMock(config?)</code></td><td><code>MockAdapterConfig</code></td></tr>
      </tbody>
    </table>

    <p>
      Each returns an opaque <code>AuthAdapterFeature</code> suitable as the
      first argument of <code>provideAuth()</code>.
    </p>
  `,
  styles: [
    `
      .lede { font-size: 1.05rem; opacity: 0.85; }
      table.params { width: 100%; border-collapse: collapse; margin: 0.75rem 0; font-size: 0.88rem; }
      .params th, .params td { text-align: left; padding: 0.35rem 0.55rem; border-bottom: 1px solid color-mix(in srgb, currentColor 12%, transparent); vertical-align: top; }
      .params th { font-weight: 600; opacity: 0.75; }
    `,
  ],
})
export class DocsApiComponent {
  readonly authServiceApi = `class AuthService {
  // Reactive state — pick observable or signal
  readonly user$:            Observable<AuthUser | null>;
  readonly isAuthenticated$: Observable<boolean>;
  readonly isLoading$:       Observable<boolean>;

  readonly user:            Signal<AuthUser | null>;
  readonly isAuthenticated: Signal<boolean>;
  readonly isLoading:       Signal<boolean>;
  readonly isAnonymous:     Signal<boolean>;  // !isLoading && !isAuthenticated

  // Actions
  init():   Promise<void>;
  login(options?:  LoginOptions):  Promise<void>;
  logout(options?: LogoutOptions): Promise<void>;
  getAccessToken(options?: TokenOptions): Promise<string | null>;
  handleRedirectCallback(): Promise<void>;

  // Convenience
  hasValidSession(): Promise<boolean>;
}`;

  readonly authProviderApi = `interface AuthProvider {
  readonly user$:            Observable<AuthUser | null>;
  readonly isAuthenticated$: Observable<boolean>;
  readonly isLoading$:       Observable<boolean>;

  init():   Promise<void>;
  login(options?:  LoginOptions):  Promise<void>;
  logout(options?: LogoutOptions): Promise<void>;
  getAccessToken(options?: TokenOptions): Promise<string | null>;
  handleRedirectCallback?(): Promise<void>;
}`;

  readonly authUserApi = `interface AuthUser {
  id:        string;                      // stable identifier
  email?:    string;
  name?:     string;
  picture?:  string;                      // avatar URL if any
  roles?:    string[];
  raw?:      Record<string, unknown>;     // original provider payload
}`;

  readonly optionTypes = `interface LoginOptions {
  redirectUrl?: string;
  scopes?:      string[];
  extra?:       Record<string, unknown>;  // forwarded to the SDK
}

interface LogoutOptions {
  redirectUrl?: string;
  extra?:       Record<string, unknown>;
}

interface TokenOptions {
  forceRefresh?: boolean;
  audience?:     string;                  // OIDC-style resource token
  scopes?:       string[];
}`;

  readonly coreConfig = `interface AuthCoreConfig {
  /** Prefix match; use '*' to attach to every outgoing request. */
  protectedResourceUrls?: string[];
  /** Where the guard redirects unauthenticated users. If omitted, the guard calls login(). */
  loginRedirectUrl?: string;
}`;
}
