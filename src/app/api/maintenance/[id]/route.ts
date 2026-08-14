import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Maintenance from "@/models/Maintenance";
import { requireSession } from "@/lib/session";
import { maintenanceCreateSchema, firstZodMessage } from "@/lib/validation";
import { serializeMaintenance } from "@/lib/serializers";
import { permissions } from "@/lib/rbac";
import { recordAudit } from "@/lib/audit";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Params) {
  const auth = await requireSession();
  if (!auth.ok) return auth.response;
  if (!permissions.manageMaintenance(auth.session.role)) {
    return NextResponse.json(
      { error: "Only fleet managers and admins can edit maintenance records." },
      { status: 403 }
    );
  }

  const { id } = await params;
  const body = await req.json();
  const parsed = maintenanceCreateSchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: firstZodMessage(parsed.error) }, { status: 400 });
  }

  await connectDB();
  const update: Record<string, unknown> = { ...parsed.data };
  if (update.vehicleId) {
    update.vehicle = update.vehicleId;
    delete update.vehicleId;
  }

  const record = await Maintenance.findByIdAndUpdate(id, update, {
    new: true,
    runValidators: true,
  }).populate("vehicle", "licensePlate make model");
  if (!record) {
    return NextResponse.json({ error: "Maintenance record not found." }, { status: 404 });
  }
  await recordAudit(auth.session.sub, "MAINTENANCE_UPDATED", record.serviceType);
  return NextResponse.json({ maintenance: serializeMaintenance(record) });
}

export async function DELETE(_req: Request, { params }: Params) {
  const auth = await requireSession(["MANAGER", "ADMIN"]);
  if (!auth.ok) return auth.response;

  const { id } = await params;
  await connectDB();
  const record = await Maintenance.findByIdAndDelete(id);
  if (!record) {
    return NextResponse.json({ error: "Maintenance record not found." }, { status: 404 });
  }
  await recordAudit(auth.session.sub, "MAINTENANCE_DELETED", record.serviceType);
  return NextResponse.json({ ok: true });
}
