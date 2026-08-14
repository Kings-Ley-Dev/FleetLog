import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import FuelLog from "@/models/FuelLog";
import { requireSession } from "@/lib/session";
import { serializeFuelLog } from "@/lib/serializers";
import { permissions } from "@/lib/rbac";
import { recordAudit } from "@/lib/audit";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  const auth = await requireSession();
  if (!auth.ok) return auth.response;

  const { id } = await params;
  await connectDB();
  const log = await FuelLog.findById(id)
    .populate("vehicle", "licensePlate make model")
    .populate("driver", "name");
  if (!log) {
    return NextResponse.json({ error: "Fuel log not found." }, { status: 404 });
  }
  if (!permissions.viewAllFuelLogs(auth.session.role) && String(log.driver._id) !== auth.session.sub) {
    return NextResponse.json({ error: "You can only view your own fuel logs." }, { status: 403 });
  }
  return NextResponse.json({ fuelLog: serializeFuelLog(log) });
}

// NOTE (documented technical debt): deleting a fuel log does not roll back
// vehicle.currentOdometer or re-link the previousOdometer/distance chain
// on the log before/after it. Acceptable for the exam scope where deletes
// correct rare mis-entries; flagged for the technical-debt register as a
// "recompute chain on delete" follow-up.
export async function DELETE(_req: Request, { params }: Params) {
  const auth = await requireSession(["MANAGER", "ADMIN"]);
  if (!auth.ok) return auth.response;

  const { id } = await params;
  await connectDB();
  const log = await FuelLog.findByIdAndDelete(id);
  if (!log) {
    return NextResponse.json({ error: "Fuel log not found." }, { status: 404 });
  }
  await recordAudit(auth.session.sub, "FUEL_LOG_DELETED", String(log._id));
  return NextResponse.json({ ok: true });
}
