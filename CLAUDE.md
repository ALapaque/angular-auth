# Repository guidelines for Claude

## Commit messages — Conventional Commits (enforced)

This repository enforces [Conventional Commits](https://www.conventionalcommits.org/).
Commits are validated locally by a `commit-msg` husky hook (commitlint) and PR titles
are validated in CI. Release versioning and `CHANGELOG.md` are driven by
[release-please](https://github.com/googleapis/release-please) — so commit accuracy
directly determines the next published version.

### Format

```
<type>(<optional scope>): <subject>

<optional body>

<optional footer(s)>
```

- Subject MUST start with a lowercase letter and be in the imperative mood
  (`add`, not `added` / `adds`).
- No trailing period in the subject.
- Keep the subject under ~72 characters.
- Wrap body lines at ~100 characters.

### Allowed types

| Type       | When to use it                                          | Version bump (pre-1.0) |
| ---------- | ------------------------------------------------------- | ---------------------- |
| `feat`     | A new user-facing feature                               | minor                  |
| `fix`      | A bug fix                                               | patch                  |
| `perf`     | A performance improvement                               | patch                  |
| `refactor` | Code change that doesn't fix a bug or add a feature     | patch                  |
| `docs`     | Documentation only                                      | patch                  |
| `test`     | Adding or fixing tests                                  | none (hidden)          |
| `build`    | Build system / ng-packagr / dependencies                | none (hidden)          |
| `ci`       | CI configuration (`.github/workflows/*`)                | none (hidden)          |
| `chore`    | Maintenance that doesn't fit elsewhere                  | none (hidden)          |
| `style`    | Formatting, whitespace — no logic change                | none (hidden)          |
| `revert`   | Revert a previous commit                                | patch                  |

### Scopes (optional but encouraged)

Use the adapter or area the change touches:

- `core` — `src/lib/core/**`
- `oidc`, `msal`, `firebase`, `supabase`, `jwt`, `mock` — the matching adapter
- `demo` — the demo app
- `docs`, `ci`, `build` — align with the type

Examples:
- `feat(supabase): add magic-link sign-in`
- `fix(oidc): guard token refresh against SSR`
- `ci: publish to npm via release-please`

### Breaking changes

Signal a breaking change by either:
1. Appending `!` after the type/scope: `feat(core)!: rename AuthService.login`
2. Adding a `BREAKING CHANGE:` footer describing the break.

Pre-1.0, breaking changes bump the **minor** version (per release-please config).

### Squash-merge rule

Pull requests are squash-merged into `main`. The **PR title** becomes the commit
on `main`, so it MUST follow Conventional Commits (validated by
`.github/workflows/pr-title.yml`). Intermediate commits on feature branches are
also validated locally by the `commit-msg` hook.

## Release flow

1. Merges to `main` feed `release-please`, which opens / updates a
   "release-please: release" PR bumping `package.json` + `CHANGELOG.md`.
2. Merging that PR creates a git tag `vX.Y.Z` and a GitHub Release.
3. The same workflow then runs `typecheck` → `test` → `build` → `npm publish`
   (with provenance) from the built `dist/`.

Never publish manually, never push tags by hand — the pipeline owns versioning.

## Working locally

- `npm install` runs `husky` via the `prepare` script; the `commit-msg` hook
  activates automatically.
- To verify a message without committing: `echo "feat: x" | npx commitlint`.
- To bypass the hook in an emergency: `git commit --no-verify` — but don't.
  Anything that lands on `main` still has to pass the PR title check, and
  an invalid type will be ignored by release-please (no changelog entry, no bump).
