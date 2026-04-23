import { Component, inject } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from 'generic-angular-auth';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterLink, RouterOutlet],
  template: `
    <h1>generic-angular-auth — demo</h1>
    <nav>
      <a routerLink="/">Home</a>
      <a routerLink="/profile">Profile (protected)</a>
    </nav>

    <div class="card">
      @if (auth.isLoading()) {
        <p>Loading session…</p>
      } @else if (auth.isAuthenticated()) {
        <p>Signed in as <strong>{{ auth.user()?.name }}</strong></p>
        <button (click)="auth.logout()">Logout</button>
      } @else {
        <p>Not signed in.</p>
        <button (click)="auth.login()">Login</button>
      }
    </div>

    <router-outlet />
  `,
})
export class AppComponent {
  readonly auth = inject(AuthService);
}
