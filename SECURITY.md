# Security Policy

## Reporting a vulnerability

If you discover a security issue in `@amaurylapaque/angular-auth`, **do not open a public
GitHub issue**. Instead, send the details privately to the maintainers via the
repository's security advisories:

> https://github.com/ALapaque/angular-auth/security/advisories/new

Please include:

- A clear description of the vulnerability.
- Step-by-step reproduction, ideally with a minimal repro (code or repository).
- The affected version (`npm ls @amaurylapaque/angular-auth` output is perfect).
- Your assessment of impact.

We aim to acknowledge reports within 3 business days and to ship a fix or a
mitigation within 30 days. Critical issues (token exfiltration, privilege
escalation, CSRF bypass) are prioritised on a rolling basis.

## Supported versions

Only the latest minor version of the `0.x` line is patched. Once a `1.0.0` is
released the supported-versions table will be updated.

| Version | Supported |
|---------|-----------|
| `0.1.x` | ✅ latest   |
| older   | ❌          |

## Security considerations for integrators

### Token storage

Access tokens and refresh tokens are extremely sensitive secrets. The adapters
in this library delegate storage to the underlying SDK where possible:

| Adapter         | Default storage                      | Controlled by                  |
|-----------------|--------------------------------------|--------------------------------|
| OIDC            | SDK default (session storage)        | `angular-auth-oidc-client`     |
| MSAL            | `localStorage`                       | `@azure/msal-browser` cache    |
| Firebase        | `localStorage` (IndexedDB fallback)  | `firebase/auth`                |
| Supabase        | `localStorage`                       | `@supabase/supabase-js`        |
| **JWT (ours)**  | **`localStorage` by default**        | `provideJwt({ storage })`      |
| Mock            | In-memory only                       | n/a                            |

`localStorage` is readable by any script running on the same origin. A single
XSS vulnerability in your application or in a third-party script loaded on the
page is enough to exfiltrate every token stored there. Mitigation options, from
strongest to most convenient:

1. **Move auth server-side.** Issue session cookies (`HttpOnly`, `Secure`,
   `SameSite=Lax`/`Strict`) from your own backend, and use the JWT adapter
   only for API calls that need a bearer. The `Authorization` header should be
   added by your backend on a proxy, never by the browser.
2. **Use `storage: 'memory'`** in the JWT adapter when you do not need tokens
   to survive a page reload. The user logs in again after every full refresh,
   but no token is persisted to disk.
3. **Use `storage: 'session'`** to scope tokens to the current tab.
4. **Tighten your CSP.** `Content-Security-Policy: default-src 'self'` with
   `script-src` explicitly listing trusted origins drastically reduces the
   blast radius of XSS.

### HTTP interceptor — wildcard matching

`AuthCoreConfig.protectedResourceUrls: ['*']` attaches the access token to
**every** outgoing HTTP request, including third-party APIs, CDNs and
analytics endpoints. This is almost never what you want — it leaks your
users' tokens to any domain you happen to call.

**Always list your own API origins explicitly:**

```ts
provideAuth(adapter, {
  protectedResourceUrls: [
    'https://api.example.com',
    'https://orders.example.com',
  ],
});
```

Use `['*']` only for local development or behind a same-origin proxy.

### Redirect URLs

OIDC, MSAL, Firebase and Supabase authenticate via redirects back to a URL you
configure (`redirectUrl`, `redirectUri`, `redirectTo`). **Always register the
full URL with the provider** and reject any other value at the provider side.
Without strict provider-side whitelisting, an attacker can forge an
authorization response that lands on a malicious domain and steals the code.

### Server-Side Rendering (SSR)

All adapters run in the browser. The JWT adapter guards against missing
browser APIs (`window`, `localStorage`, `atob`) so the server boot does not
crash, but authentication flows themselves only resume once the app rehydrates
on the client. If you use Angular Universal / SSR, ensure that no route
requires authentication to server-render — or handle it via upstream session
cookies.

### Supply chain

- This package declares every identity-provider SDK as an **optional** peer
  dependency. Installing `@amaurylapaque/angular-auth` alone pulls in nothing beyond
  Angular and RxJS.
- CI (`.github/workflows/ci.yml`) runs `npm audit` via npm's built-in checks
  on every push. Review dependency alerts promptly.
- Pin the major version of the package in your own `package.json` and review
  changelogs on minor bumps.

### Disclosure and vulnerabilities

See the top of this document for the reporting process. Coordinated disclosure
is strongly preferred.
