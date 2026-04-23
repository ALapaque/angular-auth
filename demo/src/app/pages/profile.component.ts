import { Component, inject } from '@angular/core';
import { AuthService } from 'generic-angular-auth';

@Component({
  selector: 'app-profile',
  standalone: true,
  template: `
    <div class="card">
      <h2>Profile</h2>
      <p>This route is guarded by <code>authGuard</code>.</p>
      <pre>{{ userJson() }}</pre>
    </div>
  `,
})
export class ProfileComponent {
  private readonly auth = inject(AuthService);

  userJson(): string {
    return JSON.stringify(this.auth.user(), null, 2);
  }
}
