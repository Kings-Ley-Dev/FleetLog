import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import FuelLog from "@/models/FuelLog";
import Vehicle from "@/models/Vehicle";
import { requireSession } from "@/lib/session";
import { fuelLogCreateSchema, fuelLogQuerySchema, firstZodMessage } from "@/lib/validation";
import { serializeFuelLog } from "@/lib/serializers";
import { computeFuelLog, CalculationError } from "@/lib/calculations";
import { permissions } from "@/lib/rbac";
import { recordAudit } from "@/lib/audit";

export async function GET(req: Request) {
  const auth = await requireSession();
  if (!auth.ok) return auth.response;

  const { searchParams } = new URL(req.url);
  const parsed = fuelLogQuerySchema.safeParse(Object.fromEntries(searchParams));
  if (!parsed.success) {
    return NextResponse.json({ error: firstZodMessage(parsed.error) }, { status: 400 });
  }
  const { vehicleId, driverId, dateFrom, dateTo, page, pageSize } = parsed.data;

  await connectDB();
  const filter: Record<string, unknown> = {};

  // Drivers only ever see their own history, regardless of query params.
  if (!permissions.viewAllFuelLogs(auth.session.role)) {
    filter.driver = auth.session.sub;
  } else if (driverId) {
    filter.driver = driverId;
  }
  if (vehicleId) filter.vehicle = vehicleId;
  if (dateFrom || dateTo) {
    filter.logDate = {
      ...(dateFrom ? { $gte: dateFrom } : {}),
      ...(dateTo ? { $lte: dateTo } : {}),
    };
  }

  const total = await FuelLog.countDocuments(filter);
  const items = await FuelLog.find(filter)
    .populate("vehicle", "licensePlate make model")
    .populate("driver", "name")
    .sort({ logDate: -1 })
    .skip((page - 1) * pageSize)
    .limit(pageSize);

  return NextResponse.json({
    items: items.map(serializeFuelLog),
    page,
    pageSize,
    total,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  });
}

export async function POST(req: Request) {
  const auth = await requireSession();
  if (!auth.ok) return auth.response;

  const body = await req.json();
  const parsed = fuelLogCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: firstZodMessage(parsed.error) }, { status: 400 });
  }
  const data = parsed.data;

  await connectDB();
  const vehicle = await Vehicle.findById(data.vehicleId);
  if (!vehicle) {
    return NextResponse.json({ error: "Vehicle not found." }, { status: 404 });
  }
  if (vehicle.status === "INACTIVE") {
    return NextResponse.json(
      { error: "This vehicle is inactive and can't receive new fuel logs." },
      { status: 400 }
    );
  }

  // Managers/admins may log on a driver's behalf; drivers can only log for themselves.
  let driverId = auth.session.sub;
  const bodyDriverId = (body as { driverId?: string }).driverId;
  if (bodyDriverId && permissions.viewAllFuelLogs(auth.session.role)) {
    driverId = bodyDriverId;
  }

  try {
    const { distanceTraveled, fuelEfficiencyKmL, costPerKmGHS } = computeFuelLog({
      previousOdometer: vehicle.currentOdometer,
      currentOdometer: data.currentOdometer,
      litersPurchased: data.litersPurchased,
      totalCostGHS: data.totalCostGHS,
    });

    const log = await FuelLog.create({
      vehicle: vehicle._id,
      driver: driverId,
      previousOdometer: vehicle.currentOdometer,
      currentOdometer: data.currentOdometer,
      distanceTraveled,
      litersPurchased: data.litersPurchased,
      totalCostGHS: data.totalCostGHS,
      stationName: data.stationName,
      fuelEfficiencyKmL,
      costPerKmGHS,
      logDate: data.logDate ?? new Date(),
      notes: data.notes || undefined,
    });

    vehicle.currentOdometer = data.currentOdometer;
    await vehicle.save();

    await recordAudit(
      auth.session.sub,
      "FUEL_LOG_CREATED",
      `${vehicle.licensePlate}: ${data.litersPurchased}L, ${distanceTraveled}km`
    );

    const populated = await log.populate([
      { path: "vehicle", select: "licensePlate make model" },
      { path: "driver", select: "name" },
    ]);
    return NextResponse.json({ fuelLog: serializeFuelLog(populated) }, { status: 201 });
  } catch (err) {
    if (err instanceof CalculationError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    console.error("[fuel-logs/POST]", err);
    return NextResponse.json({ error: "Could not save the fuel log." }, { status: 500 });
  }
}
