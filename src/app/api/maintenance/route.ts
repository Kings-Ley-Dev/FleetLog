import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Maintenance from "@/models/Maintenance";
import { requireSession } from "@/lib/session";
import { maintenanceCreateSchema, firstZodMessage } from "@/lib/validation";
import { serializeMaintenance } from "@/lib/serializers";
import { permissions } from "@/lib/rbac";
import { recordAudit } from "@/lib/audit";

export async function GET(req: Request) {
  const auth = await requireSession();
  if (!auth.ok) return auth.response;

  const { searchParams } = new URL(req.url);
  const vehicleId = searchParams.get("vehicleId");
  const filter: Record<string, unknown> = {};
  if (vehicleId) filter.vehicle = vehicleId;

  await connectDB();
  const records = await Maintenance.find(filter)
    .populate("vehicle", "licensePlate make model")
    .sort({ serviceDate: -1 });

  return NextResponse.json({ items: records.map(serializeMaintenance) });
}

export async function POST(req: Request) {
  const auth = await requireSession();
  if (!auth.ok) return auth.response;
  if (!permissions.manageMaintenance(auth.session.role)) {
    return NextResponse.json(
      { error: "Only fleet managers and admins can log maintenance." },
      { status: 403 }
    );
  }

  const body = await req.json();
  const parsed = maintenanceCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: firstZodMessage(parsed.error) }, { status: 400 });
  }
  const data = parsed.data;

  await connectDB();
  const record = await Maintenance.create({
    vehicle: data.vehicleId,
    serviceType: data.serviceType,
    costGHS: data.costGHS,
    serviceDate: data.serviceDate,
    odometerAtService: data.odometerAtService,
    nextDueOdometer: data.nextDueOdometer,
    notes: data.notes || undefined,
  });
  await recordAudit(auth.session.sub, "MAINTENANCE_CREATED", data.serviceType);

  const populated = await record.populate("vehicle", "licensePlate make model");
  return NextResponse.json({ maintenance: serializeMaintenance(populated) }, { status: 201 });
}
