import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  standalone: true,
  template: `
    <div class="card">
      <h2>Home</h2>
      <p>
        This demo bootstraps with the <code>Mock</code> adapter. Swap the
        <code>provideAuth(...)</code> call in <code>app.config.ts</code> to
        try OIDC, MSAL, Firebase or JWT — the rest of the app is untouched.
      </p>
    </div>
  `,
})
export class HomeComponent {}
