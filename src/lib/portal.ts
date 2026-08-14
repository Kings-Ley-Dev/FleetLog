import "server-only";

export type PortalRole = "ADMIN" | "MANAGER";

export interface PortalConfig {
  role: PortalRole;
  title: string;
  tagline: string;
}

/**
 * Resolves a URL path segment against the secret admin/manager portal
 * paths configured in the environment. Both the [secret] page and the
 * register-admin/register-manager API routes call this (or re-check the
 * same env vars directly) so a raw POST to the API can't bypass the page
 * gate — the secret has to match either way.
 */
export function resolvePortal(secret: string): PortalConfig | null {
  if (!secret) return null;

  const adminPath = process.env.ADMIN_PORTAL_PATH;
  if (adminPath && secret === adminPath) {
    return {
      role: "ADMIN",
      title: "System Admin Portal",
      tagline: "Create or sign in to a System Admin account. No approval required.",
    };
  }

  const managerPath = process.env.MANAGER_PORTAL_PATH;
  if (managerPath && secret === managerPath) {
    return {
      role: "MANAGER",
      title: "Fleet Manager Portal",
      tagline: "Create or sign in to a Fleet Manager account. No approval required.",
    };
  }

  return null;
}
