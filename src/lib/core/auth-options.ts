export interface LoginOptions {
  /** URL to return to after a successful login. Adapter may ignore if not applicable. */
  redirectUrl?: string;
  /** Requested scopes. Adapters merge these with their configured default scopes. */
  scopes?: string[];
  /** Free-form extra parameters forwarded to the underlying SDK. */
  extra?: Record<string, unknown>;
}

export interface LogoutOptions {
  redirectUrl?: string;
  extra?: Record<string, unknown>;
}

export interface TokenOptions {
  /** Force a fresh token (bypass any in-memory cache). */
  forceRefresh?: boolean;
  /** Audience / resource-specific token request when the provider supports it. */
  audience?: string;
  scopes?: string[];
}
