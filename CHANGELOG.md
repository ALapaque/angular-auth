# Changelog

All notable changes to this project will be documented in this file. The format
is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and this
project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
