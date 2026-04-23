/**
 * Provider-agnostic representation of the authenticated user.
 * `raw` preserves the original payload so consumers can still reach
 * provider-specific claims when the unified shape is not enough.
 */
export interface AuthUser {
  id: string;
  email?: string;
  name?: string;
  picture?: string;
  roles?: string[];
  raw?: Record<string, unknown>;
}
