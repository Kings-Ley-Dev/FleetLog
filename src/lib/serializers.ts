import "server-only";
import type { IUser } from "@/models/User";
import type { IVehicle } from "@/models/Vehicle";
import type { IFuelLog } from "@/models/FuelLog";
import type { IMaintenance } from "@/models/Maintenance";
import type { IAuditLog } from "@/models/AuditLog";
import type {
  UserDTO,
  VehicleDTO,
  FuelLogDTO,
  MaintenanceDTO,
  AuditLogDTO,
} from "@/types";

// Mongoose's populated refs are typed loosely at the call site, so these
// serializers accept `any`-ish populated shapes and narrow defensively.
/* eslint-disable @typescript-eslint/no-explicit-any */

export function serializeUser(user: IUser): UserDTO {
  return {
    id: String(user._id),
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
    createdAt: user.createdAt.toISOString(),
  };
}

export function serializeVehicle(vehicle: IVehicle): VehicleDTO {
  const driver = vehicle.assignedDriver as any;
  return {
    id: String(vehicle._id),
    licensePlate: vehicle.licensePlate,
    make: vehicle.make,
    model: vehicle.model,
    year: vehicle.year,
    fuelType: vehicle.fuelType,
    initialOdometer: vehicle.initialOdometer,
    currentOdometer: vehicle.currentOdometer,
    status: vehicle.status,
    assignedDriver:
      driver && typeof driver === "object" && driver.name
        ? { id: String(driver._id), name: driver.name }
        : null,
    createdAt: vehicle.createdAt.toISOString(),
  };
}

export function serializeFuelLog(log: IFuelLog): FuelLogDTO {
  const vehicle = log.vehicle as any;
  const driver = log.driver as any;
  return {
    id: String(log._id),
    vehicle: {
      id: String(vehicle?._id ?? vehicle),
      licensePlate: vehicle?.licensePlate ?? "—",
      make: vehicle?.make ?? "",
      model: vehicle?.model ?? "",
    },
    driver: {
      id: String(driver?._id ?? driver),
      name: driver?.name ?? "—",
    },
    previousOdometer: log.previousOdometer,
    currentOdometer: log.currentOdometer,
    distanceTraveled: log.distanceTraveled,
    litersPurchased: log.litersPurchased,
    totalCostGHS: log.totalCostGHS,
    stationName: log.stationName,
    fuelEfficiencyKmL: log.fuelEfficiencyKmL,
    costPerKmGHS: log.costPerKmGHS,
    logDate: log.logDate.toISOString(),
    notes: log.notes,
  };
}

export function serializeMaintenance(record: IMaintenance): MaintenanceDTO {
  const vehicle = record.vehicle as any;
  return {
    id: String(record._id),
    vehicle: {
      id: String(vehicle?._id ?? vehicle),
      licensePlate: vehicle?.licensePlate ?? "—",
      make: vehicle?.make ?? "",
      model: vehicle?.model ?? "",
    },
    serviceType: record.serviceType,
    costGHS: record.costGHS,
    serviceDate: record.serviceDate.toISOString(),
    odometerAtService: record.odometerAtService,
    nextDueOdometer: record.nextDueOdometer,
    notes: record.notes,
  };
}

export function serializeAuditLog(entry: IAuditLog): AuditLogDTO {
  const actor = entry.actor as any;
  return {
    id: String(entry._id),
    actor: { id: String(actor?._id ?? actor), name: actor?.name ?? "—" },
    action: entry.action,
    detail: entry.detail,
    createdAt: entry.createdAt.toISOString(),
  };
}
