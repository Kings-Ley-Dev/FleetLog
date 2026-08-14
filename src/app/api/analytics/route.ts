import { NextResponse } from "next/server";
import { requireSession } from "@/lib/session";
import { permissions } from "@/lib/rbac";
import { getFleetAnalytics } from "@/lib/queries";

export async function GET() {
  const auth = await requireSession();
  if (!auth.ok) return auth.response;
  if (!permissions.viewAnalytics(auth.session.role)) {
    return NextResponse.json({ error: "Manager or admin access only." }, { status: 403 });
  }

  const data = await getFleetAnalytics();
  return NextResponse.json(data);
}
