import { Routes } from '@angular/router';
import { authGuard } from 'generic-angular-auth';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => import('./pages/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'profile',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/profile.component').then((m) => m.ProfileComponent),
  },
  {
    path: 'docs',
    loadComponent: () =>
      import('./pages/docs/docs-layout.component').then((m) => m.DocsLayoutComponent),
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () =>
          import('./pages/docs/overview.component').then((m) => m.DocsOverviewComponent),
      },
      {
        path: 'install',
        loadComponent: () =>
          import('./pages/docs/install.component').then((m) => m.DocsInstallComponent),
      },
      {
        path: 'guards-interceptors',
        loadComponent: () =>
          import('./pages/docs/guards-interceptors.component').then(
            (m) => m.DocsGuardsInterceptorsComponent,
          ),
      },
      {
        path: 'custom',
        loadComponent: () =>
          import('./pages/docs/custom-adapter.component').then(
            (m) => m.DocsCustomAdapterComponent,
          ),
      },
      {
        path: 'api',
        loadComponent: () =>
          import('./pages/docs/api.component').then((m) => m.DocsApiComponent),
      },
      {
        path: 'adapters/oidc',
        loadComponent: () =>
          import('./pages/docs/adapters/oidc-doc.component').then((m) => m.DocsOidcComponent),
      },
      {
        path: 'adapters/msal',
        loadComponent: () =>
          import('./pages/docs/adapters/msal-doc.component').then((m) => m.DocsMsalComponent),
      },
      {
        path: 'adapters/firebase',
        loadComponent: () =>
          import('./pages/docs/adapters/firebase-doc.component').then(
            (m) => m.DocsFirebaseComponent,
          ),
      },
      {
        path: 'adapters/supabase',
        loadComponent: () =>
          import('./pages/docs/adapters/supabase-doc.component').then(
            (m) => m.DocsSupabaseComponent,
          ),
      },
      {
        path: 'adapters/jwt',
        loadComponent: () =>
          import('./pages/docs/adapters/jwt-doc.component').then((m) => m.DocsJwtComponent),
      },
      {
        path: 'adapters/mock',
        loadComponent: () =>
          import('./pages/docs/adapters/mock-doc.component').then((m) => m.DocsMockComponent),
      },
    ],
  },
];
