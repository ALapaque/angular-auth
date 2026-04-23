# Changelog

All notable changes to this project will be documented in this file. The format
is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and this
project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.1](https://github.com/ALapaque/angular-auth/compare/generic-angular-auth-v0.1.0...generic-angular-auth-v0.1.1) (2026-04-23)


### Features

* **demo:** rebuild home as a brutalist bento ([#8](https://github.com/ALapaque/angular-auth/issues/8)) ([6ac6565](https://github.com/ALapaque/angular-auth/commit/6ac6565f085a28e8afe423a03a77e70dc218c53e))


### Bug Fixes

* **demo:** serve SPA correctly on vercel ([#4](https://github.com/ALapaque/angular-auth/issues/4)) ([41eb8c7](https://github.com/ALapaque/angular-auth/commit/41eb8c74e36f0ecfc0d8f4fdc35f0575c0937ca2))

## [Unreleased]

### Added
- Initial release with six adapters: OIDC, MSAL, Firebase, Supabase, JWT and Mock.
- Unified `AuthService` façade exposing both observables and signals.
- Functional `authGuard` and `authInterceptor`.
- `provideAuth()` composition root with `APP_INITIALIZER`-driven bootstrap.
- Full test suite (42 specs, Vitest + `@analogjs/vitest-angular`, jsdom).
- Runnable demo app with live adapter switcher (localStorage-backed).
- Repo documentation (architecture, contributing, adapter implementation notes).
- In-app documentation site with per-adapter integration guides.
- MIT License.
- `SECURITY.md` with vulnerability disclosure policy and security guidance.
- GitHub Actions CI running tests, typecheck and build on PR and main.
