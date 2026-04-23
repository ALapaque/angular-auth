import { Component } from '@angular/core';

import { CodeBlockComponent } from '../code-block.component';

@Component({
  selector: 'app-docs-supabase',
  standalone: true,
  imports: [CodeBlockComponent],
  template: `
    <h1>Supabase adapter</h1>
    <p class="lede">
      Wraps <code>&#64;supabase/supabase-js</code>. Supports password, OTP
      (magic link) and OAuth logins. Sessions persist in localStorage and
      the SDK refreshes tokens in the background.
    </p>

    <h2>Install</h2>
    <app-code [code]="install" lang="bash" />

    <h2>Bootstrap</h2>
    <app-code [code]="bootstrap" />

    <h2>Configuration</h2>
    <table class="params">
      <thead><tr><th>Field</th><th>Type</th><th>Description</th></tr></thead>
      <tbody>
        <tr><td><code>url</code></td><td>string</td><td>Your Supabase project URL.</td></tr>
        <tr><td><code>anonKey</code></td><td>string</td><td>The <em>anon</em> / public key.</td></tr>
        <tr><td><code>clientOptions</code></td><td>SupabaseClientOptions&lt;'public'&gt;?</td><td>Forwarded to <code>createClient()</code>.</td></tr>
        <tr><td><code>defaultStrategy</code></td><td>SupabaseLoginStrategy?</td><td>Strategy used by <code>login()</code> without arguments.</td></tr>
      </tbody>
    </table>

    <h2>Login strategies</h2>
    <h3>Password</h3>
    <app-code [code]="password" />

    <h3>Magic link (OTP)</h3>
    <app-code [code]="otp" />

    <h3>OAuth (github, google, discord…)</h3>
    <app-code [code]="oauth" />

    <h2>Claim mapping</h2>
    <p>
      <code>user.id</code> → <code>id</code>, <code>user.email</code> →
      <code>email</code>, <code>user_metadata.full_name</code> →
      <code>name</code>, <code>user_metadata.avatar_url</code> →
      <code>picture</code>. Roles come from <code>app_metadata.roles</code>
      (array or single string).
    </p>

    <h2>Notes</h2>
    <ul>
      <li>The Supabase SDK owns refresh on its own. <code>getAccessToken(&#123; forceRefresh: true &#125;)</code> calls <code>auth.refreshSession()</code> explicitly.</li>
      <li><code>onAuthStateChange</code> keeps <code>user$</code> in sync with tab-level sign-ins/sign-outs (e.g. a magic-link click in another tab).</li>
    </ul>
  `,
  styles: [
    `
      table.params { width: 100%; border-collapse: collapse; margin: 0.75rem 0; font-size: 0.88rem; }
      .params th, .params td { text-align: left; padding: 0.35rem 0.55rem; border-bottom: 1px solid color-mix(in srgb, currentColor 12%, transparent); vertical-align: top; }
      .params th { font-weight: 600; opacity: 0.75; }
    `,
  ],
})
export class DocsSupabaseComponent {
  readonly install = 'npm install @supabase/supabase-js';

  readonly bootstrap = `import { provideAuth, provideSupabase } from '@amaurylapaque/angular-auth';

provideAuth(
  provideSupabase({
    url: 'https://xyz.supabase.co',
    anonKey: '...',
    defaultStrategy: { type: 'oauth', provider: 'github' },
  }),
);`;

  readonly password = `provideSupabase({
  url, anonKey,
  defaultStrategy: { type: 'password', email: 'a@b.c', password: 'secret' },
});

// or per call:
auth.login({
  extra: { strategy: { type: 'password', email, password } },
});`;

  readonly otp = `provideSupabase({
  url, anonKey,
  defaultStrategy: { type: 'otp', email: 'a@b.c' },
});
// Supabase emails a magic link; the session settles when the user clicks it
// (handleRedirectCallback runs through init() on the landing page).`;

  readonly oauth = `provideSupabase({
  url, anonKey,
  defaultStrategy: {
    type: 'oauth',
    provider: 'github',
    redirectTo: window.location.origin,
    scopes: 'read:user user:email',
  },
});`;
}
