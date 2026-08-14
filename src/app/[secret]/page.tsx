import { notFound } from "next/navigation";
import { resolvePortal } from "@/lib/portal";
import { PortalView } from "@/components/auth/PortalView";

type Props = { params: Promise<{ secret: string }> };

/**
 * Catch-all for the secret admin/manager portal links (see
 * ADMIN_PORTAL_PATH / MANAGER_PORTAL_PATH in .env). Any single-segment
 * path that doesn't match a real route or one of those two secrets falls
 * through to the standard Next.js 404 — intentionally indistinguishable
 * from "this page doesn't exist".
 */
export default async function SecretPortalPage({ params }: Props) {
  const { secret } = await params;
  const portal = resolvePortal(secret);
  if (!portal) notFound();

  return <PortalView role={portal.role} title={portal.title} tagline={portal.tagline} portalPath={secret} />;
}
