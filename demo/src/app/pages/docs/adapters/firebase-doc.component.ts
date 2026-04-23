import { Component } from '@angular/core';

import { CodeBlockComponent } from '../code-block.component';
import { PackageInstallComponent } from '../package-install.component';

@Component({
  selector: 'app-docs-firebase',
  standalone: true,
  imports: [CodeBlockComponent, PackageInstallComponent],
  template: `
    <h1>Firebase adapter</h1>
    <p class="lede">
      Firebase Authentication — email/password, popup and redirect OAuth
      providers, anonymous and custom token flows.
    </p>

    <h2>Install</h2>
    <app-package-install [groups]="installGroups" />

    <h2>Bootstrap</h2>
    <app-code [code]="bootstrap" />

    <h2>Configuration</h2>
    <table class="params">
      <thead><tr><th>Field</th><th>Type</th><th>Description</th></tr></thead>
      <tbody>
        <tr><td><code>firebaseOptions</code></td><td>FirebaseOptions</td><td>Passed to <code>initializeApp()</code> verbatim.</td></tr>
        <tr><td><code>defaultStrategy</code></td><td>FirebaseLoginStrategy?</td><td>Strategy used when <code>login()</code> is called without arguments.</td></tr>
      </tbody>
    </table>

    <h2>Login strategies</h2>
    <p>Pass a strategy at config time (default) or per call via <code>login(&#123; extra: &#123; strategy &#125; &#125;)</code>.</p>

    <h3>Email / password</h3>
    <app-code [code]="emailPassword" />

    <h3>Google (popup)</h3>
    <app-code [code]="googlePopup" />

    <h3>Google (redirect)</h3>
    <app-code [code]="googleRedirect" />

    <h3>Anonymous</h3>
    <app-code [code]="anonymous" />

    <h3>Custom token</h3>
    <app-code [code]="customToken" />

    <h2>Notes</h2>
    <ul>
      <li><code>getAccessToken(&#123; forceRefresh: true &#125;)</code> calls <code>user.getIdToken(true)</code> — the Firebase SDK auto-refreshes ~5 min before expiry on its own.</li>
      <li>Phone auth and MFA are not part of the unified contract. Inject <code>FirebaseAuthAdapter</code> directly if you need them.</li>
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
export class DocsFirebaseComponent {
  readonly installGroups = [
    { packages: 'firebase' },
  ] as const;

  readonly bootstrap = `import { GoogleAuthProvider } from 'firebase/auth';
import { provideAuth, provideFirebase } from '@amaurylapaque/angular-auth';

provideAuth(
  provideFirebase({
    firebaseOptions: {
      apiKey: '...',
      authDomain: '<project>.firebaseapp.com',
      projectId: '<project>',
    },
    defaultStrategy: { type: 'popup', provider: new GoogleAuthProvider() },
  }),
);`;

  readonly emailPassword = `provideFirebase({
  firebaseOptions: { /* ... */ },
  defaultStrategy: { type: 'email-password', email: 'a@b.c', password: 'secret' },
});

// or per call:
auth.login({
  extra: { strategy: { type: 'email-password', email, password } },
});`;

  readonly googlePopup = `import { GoogleAuthProvider } from 'firebase/auth';

provideFirebase({
  firebaseOptions: { /* ... */ },
  defaultStrategy: { type: 'popup', provider: new GoogleAuthProvider() },
});`;

  readonly googleRedirect = `import { GoogleAuthProvider } from 'firebase/auth';

provideFirebase({
  firebaseOptions: { /* ... */ },
  defaultStrategy: { type: 'redirect', provider: new GoogleAuthProvider() },
});
// handleRedirectCallback() runs automatically inside init()`;

  readonly anonymous = `provideFirebase({
  firebaseOptions: { /* ... */ },
  defaultStrategy: { type: 'anonymous' },
});`;

  readonly customToken = `auth.login({
  extra: { strategy: { type: 'custom', token: '<minted-token>' } },
});`;
}
