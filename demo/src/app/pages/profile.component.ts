import { Component, inject } from '@angular/core';
import { AuthService } from 'generic-angular-auth';

@Component({
  selector: 'app-profile',
  standalone: true,
  template: `
    <section class="container profile">
      <header class="stack-sm">
        <span class="badge badge-success badge-dot">Guarded by authGuard</span>
        <h1>Profile</h1>
        <p class="lede">
          This route is protected by the functional
          <code>authGuard</code> shipped with the library. Signed-out users are
          redirected to the home page before the component mounts.
        </p>
      </header>

      <div class="card profile-card">
        <div class="profile-head">
          <div class="profile-avatar" aria-hidden="true">
            {{ initials() }}
          </div>
          <div class="stack-sm">
            <h2 class="profile-name">{{ auth.user()?.name || 'Anonymous' }}</h2>
            @if (auth.user()?.email) {
              <p class="muted">{{ auth.user()?.email }}</p>
            }
            @if (auth.user()?.roles?.length) {
              <div class="cluster">
                @for (role of auth.user()?.roles ?? []; track role) {
                  <span class="badge badge-accent">{{ role }}</span>
                }
              </div>
            }
          </div>
        </div>

        <div class="profile-meta">
          <h3>Raw claims</h3>
          <p class="muted">Whatever the active adapter exposes via <code>auth.user()</code>.</p>
          <pre>{{ userJson() }}</pre>
        </div>
      </div>
    </section>
  `,
  styles: [
    `
      .profile { padding: var(--sp-10) 0 var(--sp-12); }
      .profile-card { margin-top: var(--sp-6); }
      .profile-head {
        display: flex;
        gap: var(--sp-5);
        align-items: center;
        padding-bottom: var(--sp-5);
        border-bottom: 1px solid var(--border);
      }
      .profile-avatar {
        display: grid;
        place-items: center;
        width: 56px; height: 56px;
        border-radius: 50%;
        background: linear-gradient(135deg, var(--accent), var(--accent-hover));
        color: var(--accent-contrast);
        font-weight: 600;
        font-size: var(--fs-lg);
        letter-spacing: 0.02em;
      }
      .profile-name { margin: 0; font-size: var(--fs-xl); }
      .profile-meta { padding-top: var(--sp-5); }
      .profile-meta h3 { margin-top: 0; }
    `,
  ],
})
export class ProfileComponent {
  readonly auth = inject(AuthService);

  initials(): string {
    const name = this.auth.user()?.name ?? '';
    const parts = name.trim().split(/\s+/).slice(0, 2);
    return parts.map((p) => p[0] ?? '').join('').toUpperCase() || '?';
  }

  userJson(): string {
    return JSON.stringify(this.auth.user(), null, 2);
  }
}
