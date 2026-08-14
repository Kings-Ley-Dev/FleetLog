import { z } from "zod";

/** Roles recognised by the system (NFR-05 / FR-02 RBAC). */
export const ROLES = ["ADMIN", "MANAGER", "DRIVER"] as const;
export type Role = (typeof ROLES)[number];

export const FUEL_TYPES = ["PETROL", "DIESEL", "HYBRID", "ELECTRIC"] as const;
export const VEHICLE_STATUSES = ["ACTIVE", "IN_SERVICE", "INACTIVE"] as const;
export const USER_STATUSES = ["ACTIVE", "PENDING", "DISABLED"] as const;

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address."),
  password: z.string().min(1, "Password is required."),
});
export type LoginInput = z.infer<typeof loginSchema>;

/** Public self-registration (driver/general user via /signup, or an
 * admin/manager via their portal link). Deliberately excludes `role` and
 * `status` — those are decided server-side, never taken from the client,
 * so nobody can register themselves straight into a privileged role. */
export const registerSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters."),
  email: z.string().trim().toLowerCase().email("Enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});
export type RegisterInput = z.infer<typeof registerSchema>;

/** Admin/Manager self-registration via a secret portal URL. `portalPath`
 * is the URL segment the person landed on; the API route re-validates it
 * against the matching env var so the check can't be bypassed by calling
 * the endpoint directly. */
export const portalRegisterSchema = registerSchema.extend({
  portalPath: z.string().trim().min(1, "Missing portal link."),
});
export type PortalRegisterInput = z.infer<typeof portalRegisterSchema>;

export const userCreateSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters."),
  email: z.string().trim().toLowerCase().email("Enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
  role: z.enum(ROLES),
});
export type UserCreateInput = z.infer<typeof userCreateSchema>;

export const userUpdateSchema = z.object({
  name: z.string().trim().min(2).optional(),
  role: z.enum(ROLES).optional(),
  status: z.enum(USER_STATUSES).optional(),
  password: z.string().min(8).optional(),
});
export type UserUpdateInput = z.infer<typeof userUpdateSchema>;

const currentYear = new Date().getFullYear();

export const vehicleCreateSchema = z.object({
  licensePlate: z
    .string()
    .trim()
    .toUpperCase()
    .min(3, "Enter a valid license plate."),
  make: z.string().trim().min(1, "Make is required."),
  model: z.string().trim().min(1, "Model is required."),
  year: z.coerce
    .number()
    .int()
    .min(1990, "Year looks too old.")
    .max(currentYear + 1, "Year can't be in the future."),
  fuelType: z.enum(FUEL_TYPES),
  initialOdometer: z.coerce.number().min(0, "Odometer can't be negative."),
  status: z.enum(VEHICLE_STATUSES).optional(),
  assignedDriver: z.string().trim().optional().or(z.literal("")),
});
export type VehicleCreateInput = z.infer<typeof vehicleCreateSchema>;

export const vehicleUpdateSchema = vehicleCreateSchema.partial();
export type VehicleUpdateInput = z.infer<typeof vehicleUpdateSchema>;

export const fuelLogCreateSchema = z.object({
  vehicleId: z.string().trim().min(1, "Select a vehicle."),
  currentOdometer: z.coerce.number().positive("Enter the current odometer reading."),
  litersPurchased: z.coerce.number().positive("Enter the liters purchased."),
  totalCostGHS: z.coerce.number().positive("Enter the total cost."),
  stationName: z.string().trim().min(1, "Enter the fuel station name."),
  logDate: z.coerce.date().optional(),
  notes: z.string().trim().max(500).optional().or(z.literal("")),
});
export type FuelLogCreateInput = z.infer<typeof fuelLogCreateSchema>;

export const fuelLogQuerySchema = z.object({
  vehicleId: z.string().trim().optional(),
  driverId: z.string().trim().optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
});

export const maintenanceCreateSchema = z.object({
  vehicleId: z.string().trim().min(1, "Select a vehicle."),
  serviceType: z.string().trim().min(1, "Enter the service type."),
  costGHS: z.coerce.number().min(0, "Cost can't be negative."),
  serviceDate: z.coerce.date(),
  odometerAtService: z.coerce.number().min(0, "Odometer can't be negative."),
  nextDueOdometer: z.coerce.number().min(0).optional(),
  notes: z.string().trim().max(500).optional().or(z.literal("")),
});
export type MaintenanceCreateInput = z.infer<typeof maintenanceCreateSchema>;

export const contactMessageSchema = z.object({
  name: z.string().trim().min(2, "Enter your name."),
  email: z.string().trim().toLowerCase().email("Enter a valid email address."),
  subject: z.string().trim().min(2, "Enter a subject."),
  message: z.string().trim().min(10, "Message must be at least 10 characters."),
});
export type ContactMessageInput = z.infer<typeof contactMessageSchema>;

/** Formats the first Zod issue into a single human-readable message. */
export function firstZodMessage(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Invalid input.";
}
