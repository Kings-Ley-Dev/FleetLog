import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Vehicle from "@/models/Vehicle";
import { requireSession } from "@/lib/session";
import { vehicleUpdateSchema, firstZodMessage } from "@/lib/validation";
import { serializeVehicle } from "@/lib/serializers";
import { permissions } from "@/lib/rbac";
import { recordAudit } from "@/lib/audit";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  const auth = await requireSession();
  if (!auth.ok) return auth.response;

  const { id } = await params;
  await connectDB();
  const vehicle = await Vehicle.findById(id).populate("assignedDriver", "name");
  if (!vehicle) {
    return NextResponse.json({ error: "Vehicle not found." }, { status: 404 });
  }
  return NextResponse.json({ vehicle: serializeVehicle(vehicle) });
}

export async function PATCH(req: Request, { params }: Params) {
  const auth = await requireSession();
  if (!auth.ok) return auth.response;
  if (!permissions.manageVehicles(auth.session.role)) {
    return NextResponse.json(
      { error: "Only fleet managers and admins can edit vehicles." },
      { status: 403 }
    );
  }

  const { id } = await params;
  const body = await req.json();
  const parsed = vehicleUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: firstZodMessage(parsed.error) }, { status: 400 });
  }

  await connectDB();
  const update: Record<string, unknown> = { ...parsed.data };
  if ("assignedDriver" in update && !update.assignedDriver) update.assignedDriver = null;
  // Odometer only ever advances via fuel logs / maintenance, not manual edits,
  // to keep the efficiency engine's readings trustworthy.
  delete update.initialOdometer;

  try {
    const vehicle = await Vehicle.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
    }).populate("assignedDriver", "name");
    if (!vehicle) {
      return NextResponse.json({ error: "Vehicle not found." }, { status: 404 });
    }
    await recordAudit(auth.session.sub, "VEHICLE_UPDATED", vehicle.licensePlate);
    return NextResponse.json({ vehicle: serializeVehicle(vehicle) });
  } catch (err: unknown) {
    if (typeof err === "object" && err && "code" in err && (err as { code: number }).code === 11000) {
      return NextResponse.json(
        { error: "A vehicle with that license plate already exists." },
        { status: 409 }
      );
    }
    console.error("[vehicles/PATCH]", err);
    return NextResponse.json({ error: "Could not update the vehicle." }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  const auth = await requireSession();
  if (!auth.ok) return auth.response;
  if (!permissions.manageVehicles(auth.session.role)) {
    return NextResponse.json(
      { error: "Only fleet managers and admins can remove vehicles." },
      { status: 403 }
    );
  }

  const { id } = await params;
  await connectDB();
  // Soft delete: fuel/maintenance history must stay intact for reporting.
  const vehicle = await Vehicle.findByIdAndUpdate(id, { status: "INACTIVE" }, { new: true });
  if (!vehicle) {
    return NextResponse.json({ error: "Vehicle not found." }, { status: 404 });
  }
  await recordAudit(auth.session.sub, "VEHICLE_DEACTIVATED", vehicle.licensePlate);
  return NextResponse.json({ vehicle: serializeVehicle(vehicle) });
}
