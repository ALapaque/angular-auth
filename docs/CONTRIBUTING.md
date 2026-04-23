# Contributing

Thanks for considering a contribution. This guide covers local development, how to add a new adapter, the test expectations and the release flow.

## Local setup

```bash
git clone <repo>
cd generic-angular-auth
npm install
```

You need **Node ≥ 20** and **npm ≥ 10**. Angular 21 workspaces tolerate earlier minor versions of Node but Node 22 is what CI runs.

Common commands:

```bash
npm test            # Vitest run (headless, jsdom)
npm run test:watch  # Vitest watch mode
npm run typecheck   # tsc --noEmit against the library
npm run build       # ng-packagr build → dist/
npm run demo        # serve the demo app on :4200
npm run demo:build  # production build of the demo
```

## Repository layout

```
src/
├── lib/
│   ├── core/                # AuthService, AuthProvider, guard, interceptor, provideAuth
│   └── adapters/
│       ├── oidc/            # angular-auth-oidc-client wrapper
│       ├── msal/            # @azure/msal-angular wrapper
│       ├── firebase/        # firebase/auth wrapper
│       ├── supabase/        # @supabase/supabase-js wrapper
│       ├── jwt/             # HttpClient-based, no external SDK
│       └── mock/            # in-memory, for dev and tests
└── public-api.ts            # ng-packagr entry point
demo/                        # runnable Angular app (Mock adapter)
docs/                        # architecture + contributor docs
```

Each adapter folder has a consistent shape:

```
adapters/<name>/
├── <name>-config.ts         # InjectionToken + typed config interface
├── <name>.adapter.ts        # @Injectable implementing AuthProvider
├── provide-<name>.ts        # provideXxx() → AuthAdapterFeature
├── <name>.adapter.spec.ts   # Vitest spec
└── index.ts                 # barrel export
```

Follow this shape when adding a new adapter.

## Adding a new adapter

1. **Scaffold the folder** mirroring an existing adapter (Supabase is the most recent template).
2. **Declare the SDK as an optional peer dependency** in `package.json`:
   ```jsonc
   "peerDependencies": { "your-sdk": ">=X.Y.Z" },
   "peerDependenciesMeta": { "your-sdk": { "optional": true } }
   ```
3. **Write the config interface** in `<name>-config.ts`. Prefer flat top-level fields; expose an `extra` escape hatch for rarely-used SDK options.
4. **Implement the adapter.** Read `docs/ARCHITECTURE.md §3 — The AuthProvider contract` and honour every invariant. In particular:
   - `init()` must be idempotent (guard with a cached `initPromise`).
   - `isAuthenticated$` must emit `false` before first resolution, never `undefined`.
   - `getAccessToken()` must return `null` instead of throwing on missing / expired / failed refresh.
   - `AuthUser.id` must be stable (never display name or email if the SDK offers a persistent id).
5. **Write `provideXxx()`** returning `AuthAdapterFeature`:
   ```ts
   return {
     providers: [
       { provide: MY_CONFIG, useValue: config },
       MyAdapter,
       { provide: AUTH_PROVIDER, useExisting: MyAdapter },
     ],
   };
   ```
6. **Export from `public-api.ts`**.
7. **Add specs** covering: init + auth-state hydration, each login pathway, logout, `getAccessToken` with and without `forceRefresh`, and at least one edge case (e.g. "no session → getAccessToken returns null"). Target ≥ 5 specs.
8. **Document** in the README (short section with a runnable snippet) and in the in-app docs at `demo/src/app/pages/docs/adapters/`.

## Writing tests

- **Framework:** Vitest 4 + jsdom, bootstrapped via `@analogjs/vitest-angular` (`src/test-setup.ts`).
- **Test file location:** co-located with the source (`mock.adapter.spec.ts` next to `mock.adapter.ts`).
- **Isolation:** never hit the network or an actual SDK endpoint. Mock the SDK with one of these techniques, ordered by preference:
  1. **Fake DI value** (`{ provide: OidcSecurityService, useValue: ... }`) — cleanest. Works when the SDK surfaces its types through Angular DI.
  2. **Adapter-exposed setter** (`adapter.setClient(fake)`) — second best. Keep the method `@internal`.
  3. **`vi.mock('module-name', ...)`** — when the adapter calls SDK module functions directly. Hoist the mock registry via `vi.hoisted(() => ({...}))` so the mocks share mutable state with the test.
- **Assertions:** verify both the observable stream (`await firstValueFrom(adapter.isAuthenticated$)`) and the call shape on the mocked SDK (`expect(fake.signOut).toHaveBeenCalled()`).
- **Shared MockAuthAdapter:** prefer it over hand-rolled fakes when testing core (`AuthService`, `authInterceptor`, `authGuard`). See `src/lib/core/auth.service.spec.ts`.

## Style

- **No comments that describe what the code does.** Only add a comment when the *why* is non-obvious (hidden invariant, workaround for an SDK bug, surprising behaviour).
- **Prefer signals for public reactive state** (`auth.user()`) and observables for composition-friendly APIs (`auth.user$`). `AuthService` exposes both.
- **Avoid premature abstraction.** Three adapters with similar patterns are fine; do not introduce a base class until you have four with *identical* behaviour.
- **Imports:** group as `@angular/*`, `<third-party>`, blank line, relative imports. Mirror the existing files.

## Commit conventions

We don't enforce a specific format, but follow these:

- Subject: imperative, ≤ 72 chars ("Add Supabase adapter" not "Added Supabase adapter").
- Body: explain the *why* and any trade-offs, not the *what*.
- One logical change per commit.

## Release

1. Make sure `npm test`, `npm run typecheck`, `npm run build` and `npm run demo:build` are all green.
2. Bump the version in `package.json`.
3. Tag: `git tag vX.Y.Z && git push --tags`.
4. Publish: `npm publish ./dist` (the folder produced by `ng-packagr`).

The `dist/` folder has its own `package.json` rewritten by ng-packagr with `scripts` and `devDependencies` stripped.

## PR checklist

Before opening a PR:

- [ ] `npm test` passes
- [ ] `npm run typecheck` passes
- [ ] `npm run build` succeeds
- [ ] New adapters have specs covering init, login, logout, token acquisition
- [ ] README + in-app docs updated if the public API changed
- [ ] No SDK added as a non-optional peer dependency
