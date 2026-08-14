import { NextResponse } from "next/server";
import type { QueryFilter } from "mongoose";
import connectDB from "@/lib/db";
import Vehicle, { type IVehicle, type VehicleStatus } from "@/models/Vehicle";
import { requireSession } from "@/lib/session";
import { vehicleCreateSchema, firstZodMessage } from "@/lib/validation";
import { serializeVehicle } from "@/lib/serializers";
import { permissions } from "@/lib/rbac";
import { recordAudit } from "@/lib/audit";

export async function GET(req: Request) {
  const auth = await requireSession();
  if (!auth.ok) return auth.response;

  await connectDB();
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");

  const filter: QueryFilter<IVehicle> = {};
  if (status) filter.status = status as VehicleStatus;

  const vehicles = await Vehicle.find(filter)
    .populate("assignedDriver", "name")
    .sort({ createdAt: -1 });

  return NextResponse.json({ vehicles: vehicles.map(serializeVehicle) });
}

export async function POST(req: Request) {
  const auth = await requireSession();
  if (!auth.ok) return auth.response;
  if (!permissions.manageVehicles(auth.session.role)) {
    return NextResponse.json(
      { error: "Only fleet managers and admins can add vehicles." },
      { status: 403 }
    );
  }

  const body = await req.json();
  const parsed = vehicleCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: firstZodMessage(parsed.error) }, { status: 400 });
  }
  const data = parsed.data;

  await connectDB();
  try {
    const vehicle = await Vehicle.create({
      licensePlate: data.licensePlate,
      make: data.make,
      model: data.model,
      year: data.year,
      fuelType: data.fuelType,
      initialOdometer: data.initialOdometer,
      currentOdometer: data.initialOdometer,
      status: data.status ?? "ACTIVE",
      assignedDriver: data.assignedDriver || null,
    });
    await recordAudit(
      auth.session.sub,
      "VEHICLE_CREATED",
      `${vehicle.licensePlate} (${vehicle.make} ${vehicle.model})`
    );
    const populated = await vehicle.populate("assignedDriver", "name");
    return NextResponse.json({ vehicle: serializeVehicle(populated) }, { status: 201 });
  } catch (err: unknown) {
    if (typeof err === "object" && err && "code" in err && (err as { code: number }).code === 11000) {
      return NextResponse.json(
        { error: "A vehicle with that license plate already exists." },
        { status: 409 }
      );
    }
    console.error("[vehicles/POST]", err);
    return NextResponse.json({ error: "Could not create the vehicle." }, { status: 500 });
  }
}
