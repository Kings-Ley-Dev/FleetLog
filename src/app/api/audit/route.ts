import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import AuditLog from "@/models/AuditLog";
import { requireSession } from "@/lib/session";
import { serializeAuditLog } from "@/lib/serializers";
import { permissions } from "@/lib/rbac";

export async function GET() {
  const auth = await requireSession();
  if (!auth.ok) return auth.response;
  if (!permissions.viewAuditLog(auth.session.role)) {
    return NextResponse.json({ error: "Admin access only." }, { status: 403 });
  }

  await connectDB();
  const entries = await AuditLog.find()
    .populate("actor", "name")
    .sort({ createdAt: -1 })
    .limit(200);

  return NextResponse.json({ items: entries.map(serializeAuditLog) });
}
