import { Component } from '@angular/core';

import { CodeBlockComponent } from './code-block.component';

@Component({
  selector: 'app-docs-guards-interceptors',
  standalone: true,
  imports: [CodeBlockComponent],
  template: `
    <h1>Guards &amp; HTTP interceptor</h1>

    <h2>Route guard</h2>
    <p>
      <code>authGuard</code> is a functional <code>CanActivateFn</code>. It
      waits for the adapter to finish bootstrapping, then either lets the
      navigation through or redirects.
    </p>
    <app-code [code]="guard" />

    <h3>Behaviour</h3>
    <ol>
      <li>Awaits <code>AuthService.init()</code> (idempotent — no-op after first call).</li>
      <li>Reads the first settled <code>isAuthenticated$</code> value.</li>
      <li>If authenticated → returns <code>true</code>.</li>
      <li>Else if <code>AuthCoreConfig.loginRedirectUrl</code> is set → redirects there.</li>
      <li>Else → calls <code>AuthService.login(&#123; redirectUrl: currentUrl &#125;)</code> and returns <code>false</code>.</li>
    </ol>

    <h3>Role-based guards</h3>
    <p>The library does not ship role/claim guards — they're trivial to build on top of <code>AuthService</code>:</p>
    <app-code [code]="roleGuard" />

    <h2>HTTP interceptor</h2>
    <p>
      <code>authInterceptor</code> attaches <code>Authorization: Bearer</code>
      to outgoing requests whose URL matches
      <code>AuthCoreConfig.protectedResourceUrls</code> (startsWith match).
    </p>
    <app-code [code]="interceptor" />

    <h3>Matching rules</h3>
    <ul>
      <li><code>['https://api.example.com']</code> — any URL starting with this prefix.</li>
      <li><code>['*']</code> — every outgoing request (not recommended: third-party APIs will receive your token).</li>
      <li><code>[]</code> (default) — no request is modified.</li>
    </ul>

    <h3>Per-request customisation</h3>
    <p>
      If you need more than a startsWith match (method filtering, header
      stripping, audience-specific tokens), write your own interceptor and
      inject <code>AuthService</code> directly:
    </p>
    <app-code [code]="customInterceptor" />
  `,
})
export class DocsGuardsInterceptorsComponent {
  readonly guard = `// app.routes.ts
import { Routes } from '@angular/router';
import { authGuard } from 'generic-angular-auth';

export const routes: Routes = [
  {
    path: 'admin',
    canActivate: [authGuard],
    loadComponent: () => import('./admin.component').then(m => m.AdminComponent),
  },
];`;

  readonly roleGuard = `import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from 'generic-angular-auth';

export function hasRole(role: string): CanActivateFn {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);
    const roles = auth.user()?.roles ?? [];
    return roles.includes(role) ? true : router.parseUrl('/forbidden');
  };
}

// usage:
// { path: 'admin', canActivate: [authGuard, hasRole('admin')], ... }`;

  readonly interceptor = `// main.ts
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor, provideAuth } from 'generic-angular-auth';

bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(withInterceptors([authInterceptor])),
    provideAuth(
      provideOidc({ /* ... */ }),
      {
        protectedResourceUrls: [
          'https://api.example.com',
          'https://orders.example.com',
        ],
      },
    ),
  ],
});`;

  readonly customInterceptor = `import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { from, switchMap } from 'rxjs';
import { AuthService } from 'generic-angular-auth';

export const audienceAwareInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  if (!req.url.startsWith('https://api.example.com')) return next(req);

  return from(auth.getAccessToken({ audience: 'https://api.example.com' })).pipe(
    switchMap((token) => next(
      token ? req.clone({ setHeaders: { Authorization: \`Bearer \${token}\` } }) : req,
    )),
  );
};`;
}
