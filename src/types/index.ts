import type { Role } from "@/lib/validation";

/**
 * Plain-object shapes returned by the API and passed into Client
 * Components. Deliberately decoupled from the Mongoose document types in
 * src/models — those carry ObjectId/Document baggage that Client
 * Components can't receive as props.
 */

export interface UserDTO {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: "ACTIVE" | "PENDING" | "DISABLED";
  createdAt: string;
}

export interface VehicleDTO {
  id: string;
  licensePlate: string;
  make: string;
  model: string;
  year: number;
  fuelType: "PETROL" | "DIESEL" | "HYBRID" | "ELECTRIC";
  initialOdometer: number;
  currentOdometer: number;
  status: "ACTIVE" | "IN_SERVICE" | "INACTIVE";
  assignedDriver: { id: string; name: string } | null;
  createdAt: string;
}

export interface FuelLogDTO {
  id: string;
  vehicle: { id: string; licensePlate: string; make: string; model: string };
  driver: { id: string; name: string };
  previousOdometer: number;
  currentOdometer: number;
  distanceTraveled: number;
  litersPurchased: number;
  totalCostGHS: number;
  stationName: string;
  fuelEfficiencyKmL: number;
  costPerKmGHS: number;
  logDate: string;
  notes?: string;
}

export interface MaintenanceDTO {
  id: string;
  vehicle: { id: string; licensePlate: string; make: string; model: string };
  serviceType: string;
  costGHS: number;
  serviceDate: string;
  odometerAtService: number;
  nextDueOdometer?: number;
  notes?: string;
}

export interface AuditLogDTO {
  id: string;
  actor: { id: string; name: string };
  action: string;
  detail?: string;
  createdAt: string;
}

export interface AnalyticsDTO {
  totalSpendGHS: number;
  totalLiters: number;
  averageEfficiencyKmL: number;
  activeVehicleCount: number;
  totalDistanceKm: number;
  monthlySpend: { month: string; spendGHS: number; liters: number }[];
  vehicleBreakdown: {
    vehicleId: string;
    licensePlate: string;
    spendGHS: number;
    efficiencyKmL: number;
    logCount: number;
  }[];
  topStations: { stationName: string; visits: number; totalSpendGHS: number }[];
}

export interface PaginatedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}
